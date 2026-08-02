import React from "react";
import bannerImg from "../../assets/banner.png";
const HeroSection = () => {
  return (
    <section className="w-full bg-[#FAF7F0] py-4 sm:py-6 lg:py-10 px-2 sm:px-6 lg:px-12 border-b border-gray-200 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-3 sm:gap-8 items-center">
          
          
          <div className="col-span-7 lg:pl-4 xl:pl-8 flex flex-col justify-center h-full py-4 lg:py-12">

            <div className="space-y-4 sm:space-y-6 lg:space-y-10 xl:space-y-12">
              
              <div>
                <span className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 lg:px-6 lg:py-3 bg-amber-100 text-amber-900 border-2 border-amber-300/60 rounded-md lg:rounded-xl text-xs sm:text-base lg:text-2xl xl:text-3xl font-extrabold shadow-md transform -rotate-2">
                  সুদ বিহীন
                </span>
              </div>

              
              <div className="flex flex-wrap items-end gap-2 sm:gap-4 lg:gap-6 xl:gap-8 my-2 lg:my-4">
                
                <span className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] xl:text-[140px] leading-none font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#E8B84B] via-[#C9942A] to-[#89600A] drop-shadow-[0_3px_3px_rgba(0,0,0,0.3)] lg:drop-shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
                  ১২৪
                </span>
                
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-8 lg:py-4 mb-1 sm:mb-2 lg:mb-4 bg-gradient-to-br from-[#063b27] to-[#042015] text-white text-sm sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-black rounded-lg lg:rounded-3xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] lg:shadow-[0_15px_30px_rgba(0,0,0,0.4)] border border-emerald-500/30">
                  কিস্তিতে
                </span>
              </div>

              
              <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-[75px] font-black text-[#0A1628] leading-tight lg:leading-[1.1] [text-shadow:_1px_1px_0_#cbd5e1,_2px_2px_4px_rgba(0,0,0,0.2)] lg:[text-shadow:_2px_2px_0_#94a3b8,_4px_4px_0_#cbd5e1,_6px_6px_15px_rgba(0,0,0,0.3)]">
                কনডোমিনিয়াম সিটিতে
              </h1>
              
              <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-[55px] font-extrabold text-[#122040] leading-tight lg:leading-[1.2] [text-shadow:_1px_1px_0_#cbd5e1,_1px_1px_3px_rgba(0,0,0,0.15)] lg:[text-shadow:_1px_1px_0_#94a3b8,_3px_3px_0_#cbd5e1,_5px_5px_10px_rgba(0,0,0,0.2)]">
                আপনার ফ্ল্যাটটি বুঝে নিন।
              </h2>
            </div>


          </div>

          {/* Right Side - Banner Image */}
          <div className="col-span-5 relative">
            {/* Soft 3D Glow/Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-300/30 via-emerald-300/20 to-transparent rounded-l-[100px] lg:rounded-l-[140px] rounded-r-3xl blur-2xl transform rotate-1 scale-105"></div>
            
            {/* 3D Image Container */}
            <div className="relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] xl:aspect-[4/3] rounded-tl-[30px] rounded-bl-[30px] sm:rounded-tl-[80px] sm:rounded-bl-[80px] lg:rounded-tl-[120px] lg:rounded-bl-[120px] rounded-tr-xl rounded-br-xl sm:rounded-tr-3xl sm:rounded-br-3xl overflow-hidden shadow-[0_10px_30px_rgba(8,_112,_184,_0.15)] sm:shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] border-[3px] sm:border-[6px] border-white/90 bg-white group transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(8,_112,_184,_0.25)]">
              <img
                src={bannerImg}
                alt="Nirapad Nibash Dar Al Aman Banner"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Inner depth shadow */}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
