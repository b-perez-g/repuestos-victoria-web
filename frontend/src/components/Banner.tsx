//components/Banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
}

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  
  // Imágenes de autos para el carrusel
  const slides: Slide[] = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2083&q=80",
      title: "Deportivos de Lujo",
      description: "Experimenta la adrenalina pura"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1580414155951-3c2d8a4b0e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      title: "SUV Premium",
      description: "Comodidad y potencia sin límites"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      title: "Sedán Ejecutivo",
      description: "Elegancia en cada kilómetro"
    }
  ];

  // Auto-play del carrusel
  useEffect(() => {
    const timer: NodeJS.Timeout = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = (): void => {
    setCurrentSlide((prev: number) => (prev + 1) % slides.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev: number) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-96 md:h-[500px] lg:h-[300px] overflow-hidden rounded-lg shadow-xl">
      {/* Contenedor de slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide: Slide, index: number) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            {/* Imagen de fondo */}
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Overlay oscuro para mejor legibilidad del texto */}
            <div className="absolute inset-0 bg-primary bg-opacity-40" />
            
            {/* Contenido del slide */}
            <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl font-medium drop-shadow-md">
                  {slide.description}
                </p>
                <button className="mt-6 px-8 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Explorar Vehículos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
        aria-label="Slide anterior"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
        aria-label="Slide siguiente"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Indicadores de slide */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_: Slide, index: number) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white shadow-lg transform scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Contador de slides */}
      <div className="absolute top-4 right-4 bg-primary bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}