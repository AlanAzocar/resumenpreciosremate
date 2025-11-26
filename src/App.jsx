import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Plus, Trash2, Upload, Image as ImageIcon, X, LayoutTemplate, Columns, MapPin } from 'lucide-react';

const App = () => {
  const previewRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Estados para los textos
  const [mainTitle, setMainTitle] = useState('Resumen de Precios');
  const [location, setLocation] = useState('General Acha, La Pampa'); 
  const [subTitle, setSubTitle] = useState('Invernada Hembras'); 
  
  // Estado para el fondo personalizado
  const [bgImage, setBgImage] = useState(null);

  // Estado: Mostrar u ocultar columna Categoría
  const [showCategory, setShowCategory] = useState(false); 
  
  // ESTADO DE LOGOS
  const [logos, setLogos] = useState([
    { id: 1, src: null, type: 'default-left' },
    { id: 2, src: null, type: 'default-center' },
    { id: 3, src: null, type: 'default-right' }
  ]);

  // Datos de la tabla 
  const [rows, setRows] = useState([
    { id: 1, category: 'Novillos', range: '120 a 150', min: '6350', max: '6350', avg: '6350' },
    { id: 2, category: 'Novillos', range: '160 a 200', min: '6050', max: '6150', avg: '6100' },
    { id: 3, category: 'Novillos', range: '210 a 250', min: '5400', max: '6150', avg: '5775' },
    { id: 4, category: 'Novillos', range: '260 a 300', min: '5250', max: '5500', avg: '5375' },
  ]);

  // Cargar html2canvas
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Función descargar
  const handleDownload = async () => {
    if (!previewRef.current || !window.html2canvas) {
      alert("Cargando generador...");
      return;
    }
    try {
      const canvas = await window.html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: bgImage ? null : '#064e3b',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 540,
        height: previewRef.current.scrollHeight 
      });
      const link = document.createElement('a');
      link.download = `placa-${new Date().getTime()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error(error);
      alert("Error al generar imagen.");
    }
  };

  // --- LOGICA DE LOGOS ---
  const handleLogoUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogos(logos.map(logo => logo.id === id ? { ...logo, src: reader.result } : logo));
      };
      reader.readAsDataURL(file);
    }
  };

  const addLogo = () => {
    const newId = logos.length > 0 ? Math.max(...logos.map(l => l.id)) + 1 : 1;
    setLogos([...logos, { id: newId, src: null, type: 'custom' }]);
  };

  const removeLogo = (id) => {
    setLogos(logos.filter(l => l.id !== id));
  };

  const clearLogoImage = (id) => {
    setLogos(logos.map(logo => logo.id === id ? { ...logo, src: null } : logo));
  };

  // --- LOGICA FONDO ---
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- LOGICA TABLA (CÁLCULO AUTOMÁTICO DE PROMEDIO) ---
  const updateRow = (id, field, value) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Si cambiamos Min o Max, intentamos calcular el promedio
        if (field === 'min' || field === 'max') {
          // Obtenemos los valores actuales (el nuevo valor ingresado o el que ya estaba)
          const rawMin = field === 'min' ? value : row.min;
          const rawMax = field === 'max' ? value : row.max;
          
          const valMin = parseFloat(rawMin);
          const valMax = parseFloat(rawMax);

          // Solo calculamos si ambos son números válidos
          if (!isNaN(valMin) && !isNaN(valMax)) {
            updatedRow.avg = Math.round((valMin + valMax) / 2).toString();
          }
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: newId, category: 'Categoría', range: '000 a 000', min: '0', max: '0', avg: '0' }]);
  };
  const deleteRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pb-20">
      
      {/* Header */}
      <header className="bg-white shadow-sm mb-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-green-800 flex items-center gap-2">
            <Camera className="w-6 h-6" /> Generador Flexible
            </h1>
            <button 
                onClick={handleDownload}
                disabled={!isScriptLoaded}
                className={`bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all ${!isScriptLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Download size={18} /> <span className="hidden md:inline">Descargar JPG</span>
            </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 relative">
        
        {/* COLUMNA IZQUIERDA: EDITOR */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Textos */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Textos Principales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título Principal</label>
                <input type="text" value={mainTitle} onChange={(e) => setMainTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none" />
              </div>
              
              {/* CAMPO DE UBICACIÓN */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ubicación / Lugar</label>
                <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none" 
                        placeholder="Ej: General Acha, La Pampa"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtítulo (Categoría)</label>
                <input type="text" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none" />
              </div>
            </div>
          </div>

          {/* 2. Fondo */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2 flex items-center gap-2">
                <ImageIcon size={18} /> Fondo
            </h2>
            <div className="flex flex-col gap-3">
                {bgImage ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden group border border-gray-300">
                        <img src={bgImage} alt="Fondo" className="w-full h-full object-cover" />
                        <button onClick={() => setBgImage(null)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700"><Trash2 size={16} /></button>
                    </div>
                ) : (
                    <label className="w-full flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 group">
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2" />
                        <span className="text-sm text-gray-600">Subir Fondo</span>
                        <input type='file' className="hidden" onChange={handleBgUpload} accept="image/*" />
                    </label>
                )}
            </div>
          </div>

          {/* 3. Logos */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-700">Logos</h2>
              <button onClick={addLogo} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition">
                <Plus size={14} /> AGREGAR
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {logos.map((logo, idx) => (
                <div key={logo.id} className="relative group">
                  <div className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-green-500 transition-colors">
                    {logo.src ? (
                      <img src={logo.src} alt={`Logo ${idx}`} className="w-full h-full object-contain p-2" />
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-green-600">
                        <Upload size={18} />
                        <span className="text-[9px] mt-1 font-bold">SUBIR</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, logo.id)} />
                      </label>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 flex gap-1">
                     <button onClick={() => removeLogo(logo.id)} className="bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"><X size={12} /></button>
                  </div>
                  {logo.src && (
                     <button onClick={() => clearLogoImage(logo.id)} className="absolute bottom-1 right-1 bg-gray-600/80 text-white p-1 rounded-full shadow hover:bg-gray-800"><Trash2 size={10} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Precios */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
            <div className="flex flex-col gap-4 mb-4 border-b pb-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-700">Precios</h2>
                    <button onClick={addRow} className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition">
                        <Plus size={14} /> AGREGAR
                    </button>
                </div>
                
                {/* INTERRUPTOR DE COLUMNA CATEGORÍA */}
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={showCategory}
                            onChange={(e) => setShowCategory(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Columns size={16} />
                        Mostrar columna "Categoría"
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 text-center">
                  <tr>
                    {showCategory && <th className="px-1 py-2 text-left">Categoría</th>}
                    <th className="px-1 py-2">Kg</th>
                    <th className="px-1 py-2">Min</th>
                    <th className="px-1 py-2">Max</th>
                    <th className="px-1 py-2">Prom</th>
                    <th className="px-1 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {showCategory && (
                          <td className="p-1"><textarea rows="1" value={row.category} onChange={(e) => updateRow(row.id, 'category', e.target.value)} className="w-full min-w-[100px] p-1 border rounded resize-y" placeholder="Ej: Novillos" /></td>
                      )}
                      {/* CAMPO DE RANGO (Kg) AJUSTADO */}
                      <td className="p-1">
                          <input 
                            type="text" 
                            value={row.range} 
                            onChange={(e) => updateRow(row.id, 'range', e.target.value)} 
                            className="w-full min-w-[110px] text-center p-1 border rounded" 
                          />
                      </td>
                      {/* CAMPOS DE VALORES AUMENTADOS */}
                      <td className="p-1"><input type="text" value={row.min} onChange={(e) => updateRow(row.id, 'min', e.target.value)} className="w-full min-w-[75px] text-center p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" value={row.max} onChange={(e) => updateRow(row.id, 'max', e.target.value)} className="w-full min-w-[75px] text-center p-1 border rounded" /></td>
                      <td className="p-1"><input type="text" value={row.avg} onChange={(e) => updateRow(row.id, 'avg', e.target.value)} className="w-full min-w-[75px] text-center p-1 border rounded font-bold text-green-700" /></td>
                      <td className="p-1 text-center"><button onClick={() => deleteRow(row.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: VISUALIZADOR (Sticky) */}
        <div className="lg:col-span-7 flex flex-col items-center lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-bold text-gray-400 uppercase mb-2 text-center w-full">Vista Previa</h2>
            <div className="rounded-xl overflow-x-auto overflow-y-hidden shadow-2xl border-4 border-gray-800 bg-gray-800 flex justify-center pb-2 w-full max-w-full">
                <div 
                    ref={previewRef}
                    className="relative flex-shrink-0 flex flex-col items-center px-6 py-8 box-border"
                    style={{
                        width: '540px',
                        minHeight: '675px', // Mínimo de altura (formato Instagram)
                        height: 'auto',     // Crece si es necesario
                        backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(135deg, #0e5e3a 0%, #064e3b 40%, #022c22 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {bgImage && <div className="absolute inset-0 bg-black/40 z-0 h-full"></div>}
                    {!bgImage && (
                        <div className="absolute inset-0 opacity-5 pointer-events-none h-full" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
                    )}
                    
                    {/* TÍTULO PRINCIPAL */}
                    <h1 className="relative z-10 text-white text-4xl font-bold mb-3 drop-shadow-md text-center w-full tracking-tight leading-tight">{mainTitle}</h1>

                    {/* UBICACIÓN */}
                    {location && (
                        <p className="relative z-10 text-white/90 text-lg font-medium mb-8 drop-shadow-md text-center w-full flex items-center justify-center gap-1">
                            📍 {location}
                        </p>
                    )}

                    {/* LOGOS */}
                    <div className={`relative z-10 w-full flex items-center mb-8 h-24 px-2 gap-4 ${logos.length <= 1 ? 'justify-center' : 'justify-between'}`}>
                        {logos.map((logo) => (
                          <div key={logo.id} className="flex-1 flex justify-center items-center h-full max-w-[33%]">
                              {logo.src ? (
                                  <img src={logo.src} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-lg" />
                              ) : (
                                  <div className="flex flex-col items-center justify-center opacity-70 scale-90">
                                      <div className="bg-white/10 p-3 rounded-full mb-1 border-2 border-dashed border-white/30">
                                          <ImageIcon className="text-white/80 w-8 h-8" />
                                      </div>
                                      <p className="text-white/60 text-[9px] uppercase font-bold tracking-widest">Logo</p>
                                  </div>
                              )}
                          </div>
                        ))}
                    </div>

                    {/* SUBTÍTULO */}
                    <h2 className="relative z-10 text-white text-2xl font-semibold mb-5 drop-shadow-md text-center w-full">{subTitle}</h2>

                    {/* TABLA PRINCIPAL - SIN FLEX-GROW PARA QUE SE AJUSTE AL CONTENIDO */}
                    <div className="relative z-10 w-full flex flex-col justify-start">
                        <div className="w-full border-2 border-white/90 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-[4px] shadow-2xl">
                            
                            <table className="w-full border-collapse table-fixed">
                                <colgroup>
                                    {showCategory ? (
                                        <>
                                            <col className="w-[28%]" />
                                            <col className="w-[18%]" />
                                            <col className="w-[18%]" />
                                            <col className="w-[18%]" />
                                            <col className="w-[18%]" />
                                        </>
                                    ) : (
                                        <>
                                            <col className="w-[28%]" />
                                            <col className="w-[24%]" />
                                            <col className="w-[24%]" />
                                            <col className="w-[24%]" />
                                        </>
                                    )}
                                </colgroup>

                                <thead>
                                    <tr className="bg-white/10 text-white font-semibold text-lg border-b-2 border-white/90">
                                        {/* Si hay categoría, mostramos la celda rayada */}
                                        {showCategory && (
                                            <th className="relative border-r-2 border-white/90 h-12"
                                                style={{
                                                    background: 'repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 8px)'
                                                }}
                                            ></th>
                                        )}
                                        <th className="border-r-2 border-white/90 py-2">Kg</th>
                                        <th className="border-r-2 border-white/90 py-2">Min</th>
                                        <th className="border-r-2 border-white/90 py-2">Max</th>
                                        <th className="py-2">Prom.</th>
                                    </tr>
                                </thead>

                                <tbody className="text-white text-lg font-normal leading-tight">
                                    {rows.map((row, index) => (
                                        <tr key={row.id} className={`${index !== rows.length - 1 ? 'border-b border-white/40' : ''}`}>
                                            {showCategory && (
                                                <td className="border-r-2 border-white/40 py-2 px-2 text-center text-base leading-tight break-words align-middle">
                                                    {row.category}
                                                </td>
                                            )}
                                            <td className="border-r-2 border-white/40 py-2 text-center align-middle">
                                                {row.range}
                                            </td>
                                            <td className="border-r-2 border-white/40 py-2 text-center align-middle">
                                                {row.min}
                                            </td>
                                            <td className="border-r-2 border-white/40 py-2 text-center align-middle">
                                                {row.max}
                                            </td>
                                            <td className="py-2 text-center align-middle">
                                                {row.avg}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    </div>
                    
                    <div className="relative z-10 mt-auto pt-8 text-white/60 text-[9px] uppercase tracking-widest text-center w-full font-semibold shadow-black drop-shadow-md">
                        Todos los valores expresados son en ARS
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;