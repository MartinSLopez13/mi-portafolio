import React from 'react';

export const ProductCard = ({ product, onAddToCart }) => {
  const { name, category, price, image, isNew, stock } = product;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col overflow-hidden h-full">
      <div className="relative pt-[100%] w-full bg-gray-50 overflow-hidden group">
        <img
          src={image || "https://via.placeholder.com/300x300?text=SantoMate"}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {isNew && (
          <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            Nuevo
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            {category}
          </span>
          <h3 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2 min-h-[2.5rem]" title={name}>
            {name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Precio Mayorista</span>
            <span className="text-lg font-black text-gray-900">
              {formatPrice(price)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={stock === 0}
            className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95'
            }`}
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
};