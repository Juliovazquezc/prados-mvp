import React, { useReducer, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/components/Spinner";

interface ListingEditFormProps {
  initialState: ListingEditFormState;
  categories: string[];
  maxImages?: number;
  isSaving: boolean;
  onSave: (state: ListingEditFormState) => void;
  onCancel: () => void;
}

export interface ListingEditFormState {
  title: string;
  description: string;
  price: string;
  categories: string[];
  showInHomepage: boolean;
  newImages: File[];
  imagesToDelete: string[];
  images: string[];
  showCategoryDropdown: boolean;
}

type Action =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_PRICE"; payload: string }
  | { type: "SET_CATEGORIES"; payload: string[] }
  | { type: "TOGGLE_CATEGORY"; payload: string }
  | { type: "SET_SHOW_IN_HOMEPAGE"; payload: boolean }
  | { type: "ADD_NEW_IMAGES"; payload: File[] }
  | { type: "REMOVE_NEW_IMAGE"; payload: number }
  | { type: "TOGGLE_IMAGE_TO_DELETE"; payload: string }
  | { type: "SET_SHOW_CATEGORY_DROPDOWN"; payload: boolean }
  | { type: "RESET"; payload: ListingEditFormState };

function reducer(
  state: ListingEditFormState,
  action: Action
): ListingEditFormState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_DESCRIPTION":
      return { ...state, description: action.payload };
    case "SET_PRICE":
      return { ...state, price: action.payload };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "TOGGLE_CATEGORY":
      return state.categories.includes(action.payload)
        ? {
            ...state,
            categories: state.categories.filter((c) => c !== action.payload),
          }
        : { ...state, categories: [...state.categories, action.payload] };
    case "SET_SHOW_IN_HOMEPAGE":
      return { ...state, showInHomepage: action.payload };
    case "ADD_NEW_IMAGES":
      return { ...state, newImages: [...state.newImages, ...action.payload] };
    case "REMOVE_NEW_IMAGE":
      return {
        ...state,
        newImages: state.newImages.filter((_, i) => i !== action.payload),
      };
    case "TOGGLE_IMAGE_TO_DELETE":
      return state.imagesToDelete.includes(action.payload)
        ? {
            ...state,
            imagesToDelete: state.imagesToDelete.filter(
              (url) => url !== action.payload
            ),
          }
        : {
            ...state,
            imagesToDelete: [...state.imagesToDelete, action.payload],
          };
    case "SET_SHOW_CATEGORY_DROPDOWN":
      return { ...state, showCategoryDropdown: action.payload };
    case "RESET":
      return { ...action.payload };
    default:
      return state;
  }
}

const ListingEditForm: React.FC<ListingEditFormProps> = ({
  initialState,
  categories,
  maxImages = 5,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const categorySelectRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!state.showCategoryDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categorySelectRef.current &&
        !categorySelectRef.current.contains(event.target as Node)
      ) {
        dispatch({ type: "SET_SHOW_CATEGORY_DROPDOWN", payload: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [state.showCategoryDropdown]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    dispatch({ type: "ADD_NEW_IMAGES", payload: files });
  };

  const removeNewImage = (index: number) => {
    dispatch({ type: "REMOVE_NEW_IMAGE", payload: index });
  };

  const toggleImageToDelete = (imageUrl: string) => {
    dispatch({ type: "TOGGLE_IMAGE_TO_DELETE", payload: imageUrl });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(state);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={state.title}
          onChange={(e) =>
            dispatch({ type: "SET_TITLE", payload: e.target.value })
          }
          placeholder="Título"
          className="text-2xl font-bold"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Precio ($)</Label>
        <Input
          id="price"
          type="number"
          value={state.price}
          onChange={(e) =>
            dispatch({ type: "SET_PRICE", payload: e.target.value })
          }
          placeholder="Precio"
          className="text-xl font-semibold text-marketplace-primary"
        />
      </div>
      <div className="space-y-2">
        <Label>Categorías</Label>
        <div className="relative" ref={categorySelectRef}>
          <button
            type="button"
            className="w-full border rounded-md px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-marketplace-primary border-gray-300"
            aria-haspopup="listbox"
            aria-expanded={state.showCategoryDropdown}
            tabIndex={0}
            aria-label="Seleccionar categorías"
            onClick={() =>
              dispatch({
                type: "SET_SHOW_CATEGORY_DROPDOWN",
                payload: !state.showCategoryDropdown,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                dispatch({
                  type: "SET_SHOW_CATEGORY_DROPDOWN",
                  payload: !state.showCategoryDropdown,
                });
            }}
          >
            {state.categories.length === 0 ? (
              <span className="text-gray-400">Seleccionar categorías</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {state.categories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-marketplace-primary text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border border-marketplace-primary shadow-sm"
                  >
                    {cat}
                    <button
                      type="button"
                      className="ml-1 text-white hover:text-red-200 focus:outline-none"
                      aria-label={`Eliminar ${cat}`}
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "TOGGLE_CATEGORY", payload: cat });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          dispatch({ type: "TOGGLE_CATEGORY", payload: cat });
                        }
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </button>
          {state.showCategoryDropdown && (
            <ul
              className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              {categories.map((cat) => (
                <li
                  key={cat}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-marketplace-primary/10"
                  role="option"
                  aria-selected={state.categories.includes(cat)}
                  tabIndex={0}
                  onClick={() =>
                    dispatch({ type: "TOGGLE_CATEGORY", payload: cat })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      dispatch({ type: "TOGGLE_CATEGORY", payload: cat });
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={state.categories.includes(cat)}
                    readOnly
                    className="mr-2"
                    tabIndex={-1}
                  />
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-homepage"
          checked={state.showInHomepage}
          onCheckedChange={(checked) =>
            dispatch({ type: "SET_SHOW_IN_HOMEPAGE", payload: checked })
          }
        />
        <Label htmlFor="show-homepage" className="cursor-pointer">
          Mostrar en inicio
        </Label>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Imágenes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {state.images
            .filter((img) => !state.imagesToDelete.includes(img))
            .map((img, index) => (
              <div key={img} className="relative group aspect-square">
                <img
                  src={img}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleImageToDelete(img);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-6 w-6 text-white" />
                </button>
              </div>
            ))}
          {state.newImages.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`Nueva imagen ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNewImage(index);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-6 w-6 text-white" />
              </button>
            </div>
          ))}
          {state.images.length -
            state.imagesToDelete.length +
            state.newImages.length <
            maxImages && (
            <label className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Plus className="h-6 w-6 text-gray-400" />
            </label>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={(e) =>
            dispatch({ type: "SET_DESCRIPTION", payload: e.target.value })
          }
          placeholder="Descripción"
          className="min-h-[200px]"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Spinner className="h-4 w-4 mr-1" /> : null}
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default ListingEditForm;
