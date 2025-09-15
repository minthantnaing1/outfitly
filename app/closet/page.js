// "use client";
// import { useState } from "react";

// export default function Closet() {
//   const [images, setImages] = useState([]);

//   const handleUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newImages = files.map((file) => ({
//       id: file.name,
//       name: file.name,
//       url: URL.createObjectURL(file),
//       type: "",
//       color: "",
//     }));
//     setImages([...images, ...newImages]);
//   };

//   return (
//     <main className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Upload Your Clothes</h2>
//       <input type="file" accept="image/*" multiple onChange={handleUpload} />
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//         {images.map((img) => (
//           <div key={img.id}>
//             <img
//               src={img.url}
//               alt={img.name}
//               className="w-full h-auto rounded"
//             />
//             <p className="mt-2 text-sm text-center">{img.name}</p>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }
"use client";
import { useState } from "react";

export default function Closet() {
  const [images, setImages] = useState([]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: file.name,
      name: file.name,
      url: URL.createObjectURL(file),
      type: "",
      color: "",
    }));
    setImages([...images, ...newImages]);
  };

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Your Clothes</h2>
      <input type="file" accept="image/*" multiple onChange={handleUpload} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {images.map((img) => (
          <div key={img.id}>
            <img
              src={img.url || "/placeholder.svg"}
              alt={img.name}
              className="w-full h-auto rounded"
            />
            <p className="mt-2 text-sm text-center">{img.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
