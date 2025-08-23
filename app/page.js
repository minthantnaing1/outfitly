// "use client";
// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-white text-gray-900">
//       {/* NAVIGATION BAR */}
//       <nav className="bg-black text-white px-6 py-4 flex justify-between items-center shadow">
//         <h1 className="text-xl font-bold">👗 Outfitly</h1>
//         <div className="space-x-4">
//           <Link href="/" className="hover:text-pink-300">
//             Home
//           </Link>
//           <Link href="/recommend" className="hover:text-pink-300">
//             Recommend
//           </Link>
//           <Link href="/chatbot" className="hover:text-pink-300">
//             Chatbot
//           </Link>
//           <Link href="#about" className="hover:text-pink-300">
//             About
//           </Link>
//         </div>
//       </nav>

//       {/* HERO SECTION */}
//       <section className="bg-pink-100 py-16 px-6 text-center">
//         <h2 className="text-4xl font-bold mb-4">
//           Your Personal AI Fashion Stylist
//         </h2>
//         <p className="text-lg max-w-xl mx-auto mb-6">
//           Outfitly helps you decide what to wear based on your wardrobe, mood,
//           and the weather. Get daily suggestions, virtual try-ons, and personal
//           styling advice – all powered by AI.
//         </p>
//         <Link
//           href="/recommend"
//           className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
//         >
//           Try Recommendations
//         </Link>
//       </section>

//       {/* ABOUT SECTION */}
//       <section id="about" className="py-16 px-6 max-w-4xl mx-auto">
//         <h3 className="text-3xl font-bold text-center mb-10">Why Outfitly?</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
//           <div>
//             <h4 className="text-xl font-semibold mb-2">
//               👚 Personalized Styling
//             </h4>
//             <p>
//               We generate outfits that match your wardrobe, mood, and occasion
//               using AI-based similarity algorithms.
//             </p>
//           </div>
//           <div>
//             <h4 className="text-xl font-semibold mb-2">
//               🌦️ Weather-Aware Looks
//             </h4>
//             <p>
//               Our outfit engine takes your local weather into account — dress
//               right every day!
//             </p>
//           </div>
//           <div>
//             <h4 className="text-xl font-semibold mb-2">
//               🤖 AI Chatbot Assistant
//             </h4>
//             <p>
//               Ask anything from “What should I wear to a party?” to “Can I wear
//               this shirt again?”
//             </p>
//           </div>
//           <div>
//             <h4 className="text-xl font-semibold mb-2">
//               🛍️ Smart Shopping & Reuse
//             </h4>
//             <p>
//               Reuse your own clothes creatively, and shop smarter with
//               recommendations tailored to your style.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="bg-gray-100 text-center py-4 mt-10">
//         <p className="text-sm text-gray-600">
//           © 2025 Outfitly. All rights reserved.
//         </p>
//       </footer>
//     </div>
//   );
// }
"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAVIGATION BAR */}
      <nav className="bg-black text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">👗 Outfitly</h1>
        <div className="space-x-4">
          <Link href="/" className="hover:text-pink-300">
            Home
          </Link>
          <Link href="/recommend" className="hover:text-pink-300">
            Recommend
          </Link>
          <Link href="/wardrobe" className="hover:text-pink-300">
            Wardrobe
          </Link>
          <Link href="/shop" className="hover:text-pink-300">
            Shop
          </Link>
          <Link href="/chat" className="hover:text-pink-300">
            Chatbot
          </Link>
          <Link href="#about" className="hover:text-pink-300">
            About
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-pink-100 py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Your Personal AI Fashion Stylist
        </h2>
        <p className="text-lg max-w-xl mx-auto mb-6">
          Outfitly helps you decide what to wear based on your wardrobe, mood,
          and the weather. Get daily suggestions, virtual try-ons, and personal
          styling advice – all powered by AI.
        </p>
        <Link
          href="/recommend"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
        >
          Try Recommendations
        </Link>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-16 px-6 max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-10">Why Outfitly?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
          <div>
            <h4 className="text-xl font-semibold mb-2">
              👚 Personalized Styling
            </h4>
            <p>
              We generate outfits that match your wardrobe, mood, and occasion
              using AI-based similarity algorithms.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">
              🌦️ Weather-Aware Looks
            </h4>
            <p>
              Our outfit engine takes your local weather into account — dress
              right every day!
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">
              🤖 AI Chatbot Assistant
            </h4>
            <p>
              Ask anything from “What should I wear to a party?” to “Can I wear
              this shirt again?”
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">
              🛍️ Smart Shopping & Reuse
            </h4>
            <p>
              Reuse your own clothes creatively, and shop smarter with
              recommendations tailored to your style.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 text-center py-4 mt-10">
        <p className="text-sm text-gray-600">
          © 2025 Outfitly. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
