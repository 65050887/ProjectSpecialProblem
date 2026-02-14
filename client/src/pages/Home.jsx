import React from "react";
import {
  Search,
  Star,
  MapPin,
  Users,
  BadgeCheck,
  ChevronRight,
  MessageCircle,
  BadgeDollarSign,
  ShieldCheck,
} from "lucide-react";

const PRIMARY = "#F16323";
const BLUE = "#0066CC";
const REVIEW_BG = "#F1A323";

const IconWrap = ({ children }) => (
  <span className="inline-flex items-center justify-center">{children}</span>
);

const Home = () => {
  const stats = [
    { num: "72", label: "Total Dormitory" },
    { num: "5,632", label: "Total Capacity" },
    { num: "500", label: "Total Rooms" },
  ];

  const zones = ["Chalongkrung 1", "Nikom", "FBT", "Jinda"];
  const dormsMock = [1, 2, 3];

  const categories = [
    {
      title: "Location",
      subtitle: "Find follow location from KMITL",
      icon: <MapPin size={26} color="white" />,
      pills: ["Radius 500 m", "Radius 1 km", "Radius 2 km"],
      showBaht: false,
    },
    {
      title: "Prices",
      subtitle: "Select the right price",
      icon: <BadgeDollarSign size={26} color="white" />,
      pills: ["2800 - 3500", "4000 - 5500", "6000 up"],
      showBaht: true,
    },
    {
      title: "Facilities",
      subtitle: "Find follow location from KMITL",
      icon: <ShieldCheck size={26} color="white" />,
      pills: ["Pet Friendly", "Key card", "Gym"],
      showBaht: false,
    },
    {
      title: "DormitoryType",
      subtitle: "Find follow location from KMITL",
      icon: <Users size={26} color="white" />,
      pills: ["Only Male", "Only Females", "Co-Ed"],
      showBaht: false,
    },
  ];

  const reviews = [1, 2, 3];

  return (
    <div className="w-full bg-white">
      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[1190px] px-6 pt-[50px] pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
            {/* Left */}
            <div>
              <span
                className="inline-flex items-center justify-center px-5 py-2 mb-6 text-sm font-bold text-white rounded-[10px]"
                style={{
                  background: PRIMARY,
                  boxShadow: "0px 4px 4px #FFE0B2",
                }}
              >
                Find Your Dormitory Away From Home
              </span>

              <h1
                className="font-bold leading-[64px] mb-6"
                style={{ color: PRIMARY, fontSize: 48 }}
              >
                Discover Your <br />
                Perfect KMITL <br />
                Dormitory
              </h1>

              <p
                className="max-w-[539px] mb-6 text-[14px] leading-[25px] text-justify"
                style={{ color: PRIMARY }}
              >
                Search through verified dormitories around KMITL with detailed
                information, photos, and real-time availability. Find the
                perfect place to call home during your studies at King
                Mongkut&apos;s Institute of Technology Ladkrabang.
              </p>

              <button
                className="inline-flex items-center gap-3 px-4 py-2 rounded-[10px] text-white font-bold text-sm"
                style={{ background: PRIMARY }}
              >
                <IconWrap>
                  <Search size={18} color="white" />
                </IconWrap>
                Start your search
                <IconWrap>
                  <ChevronRight size={18} color="white" />
                </IconWrap>
              </button>
            </div>

            {/* Right */}
            <div className="relative w-fit mx-auto">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
                alt="Dormitory"
                className="w-[420px] h-[465px] object-cover rounded-[20px]"
              />

              {/* Rating badge (บนขวา) */}
              <div
                className="absolute right-[-14px] top-[-14px] rounded-[10px] px-4 py-3 text-white"
                style={{ background: PRIMARY }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-[35px] h-[35px] rounded-full border border-white flex items-center justify-center">
                    <Star size={18} color="white" />
                  </div>

                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <Star size={14} color="white" />
                      <p className="font-bold text-[14px]">4.5</p>
                    </div>
                    <p className="font-bold text-[12px]">Average Rating</p>
                  </div>
                </div>
              </div>

              {/* Students badge (ล่างซ้าย) */}
              <div
                className="absolute left-[-14px] bottom-[-14px] rounded-[10px] px-4 py-3 text-white flex items-center gap-3"
                style={{ background: PRIMARY }}
              >
                <div className="w-[35px] h-[35px] rounded-full border border-white flex items-center justify-center">
                  <Users size={18} color="white" />
                </div>
                <p className="font-bold text-[12px] leading-[19px]">
                  5,656 Students Living <br /> on Dormitory
                </p>
              </div>

              {/* Comment button (ขวากลางตามภาพ) */}
              <button
                className="absolute right-[-170px] top-[460px] rounded-full px-6 py-3 text-white font-bold text-[14px] flex items-center gap-3"
                style={{ background: PRIMARY }}
              >
                <MessageCircle size={18} color="white" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS + LINE ================= */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-[1190px] px-6">
          <div className="flex flex-col items-center">
            <div className="w-full grid grid-cols-1 md:grid-cols-3 text-center gap-10 py-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <p
                    className="font-bold text-[24px] leading-[32px]"
                    style={{ color: PRIMARY }}
                  >
                    {s.num}
                  </p>
                  <p
                    className="text-[20px] leading-[26px]"
                    style={{ color: PRIMARY }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="w-full border-t" style={{ borderColor: "#D9D9D9" }} />
          </div>
        </div>
      </section>

      {/* ================= DORM LIST ================= */}
      <section className="mx-auto w-full max-w-[1190px] px-6 pt-14 pb-16">
        <div className="flex flex-col gap-[88px]">
          {zones.map((zone) => (
            <div key={zone} className="flex flex-col gap-[52px]">
              {/* header row */}
              <div className="flex items-center justify-between">
                <h2
                  className="font-bold text-[24px] leading-[32px]"
                  style={{ color: PRIMARY }}
                >
                  {zone}
                </h2>

                <button
                  className="flex items-center gap-1 text-[20px] leading-[26px]"
                  style={{ color: PRIMARY }}
                >
                  All <ChevronRight size={20} color={PRIMARY} />
                </button>
              </div>

              {/* cards row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {dormsMock.map((i) => (
                  <div
                    key={`${zone}-${i}`}
                    className="w-full max-w-[380px] h-[370px] rounded-[20px] overflow-hidden bg-white"
                    style={{ border: `1px solid ${PRIMARY}` }}
                  >
                    <div className="relative h-[200px] w-full">
                      <img
                        src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
                        alt="dorm"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#42BD41] text-white text-[14px] leading-[19px]">
                        <BadgeCheck size={18} color="white" />
                        verify
                      </span>
                    </div>

                    <div className="px-6 pt-5 pb-6">
                      <h3
                        className="font-bold text-[20px] leading-[26px]"
                        style={{ color: PRIMARY }}
                      >
                        Duang Ra Wee
                      </h3>

                      <div className="mt-3 flex items-center gap-2">
                        <MapPin size={16} color={PRIMARY} />
                        <p
                          className="text-[16px] leading-[21px]"
                          style={{ color: PRIMARY }}
                        >
                          distance 0.5 km form kmitl
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 text-[14px] font-bold leading-[19px]"
                          style={{ color: PRIMARY }}
                        >
                          <Star size={16} color={PRIMARY} />
                          4.5 (128 Review)
                        </div>

                        <div
                          className="flex items-center gap-2 text-[12px] font-bold leading-[19px]"
                          style={{ color: PRIMARY }}
                        >
                          <BadgeDollarSign size={16} color={PRIMARY} />
                          3500 - 5500 / Month
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-2">
            <button
              className="w-[300px] h-[60px] rounded-[20px] text-white font-bold text-[18px] leading-[24px]"
              style={{ background: PRIMARY }}
            >
              See all Dormitories
            </button>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY ================= */}
      <section className="w-full" style={{ background: BLUE }}>
        <div className="mx-auto w-full max-w-[1296px] px-[72px] py-[50px]">
          <div className="flex flex-col items-center gap-[42px]">
            <div className="text-center">
              <h2 className="text-white font-bold text-[30px] leading-[40px]">
                Find follow category
              </h2>
              <p className="text-white text-[20px] leading-[32px] mt-2">
                Choose the search channel that best suits your needs
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
              {categories.map((c) => (
                <div
                  key={c.title}
                  className="w-full h-[400px] rounded-[30px] bg-white px-5 py-6 flex flex-col items-center"
                >
                  <div
                    className="w-[65px] h-[65px] rounded-full flex items-center justify-center"
                    style={{ background: PRIMARY }}
                  >
                    {c.icon}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-black font-bold text-[16px] leading-[25px]">
                      {c.title}
                    </p>
                    <p className="text-black text-[12px] leading-[19px] mt-1">
                      {c.subtitle}
                    </p>
                  </div>

                  <div className="mt-8 w-[170px] flex flex-col gap-5">
                    {c.pills.map((p) => (
                      <button
                        key={p}
                        className="h-[30px] w-full rounded-full text-white text-[14px] leading-[22px] flex items-center justify-center gap-2"
                        style={{ background: PRIMARY }}
                      >
                        {c.showBaht ? (
                          <>
                            <span>฿ {p}</span>
                          </>
                        ) : (
                          <span>{p}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= REVIEW ================= */}
      <section className="w-full" style={{ background: REVIEW_BG }}>
        <div className="mx-auto w-full max-w-[1204px] px-[72px] py-[50px] mt-20">
          <div className="flex flex-col items-center gap-12">
            <div className="text-center">
              <h2 className="text-white font-bold text-[32px] leading-[42px]">
                Review
              </h2>
              <p className="text-white text-[20px] leading-[32px] mt-2">
                Experience from student who find dormitory with us
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((i) => (
                <div
                  key={i}
                  className="w-full h-[240px] rounded-[30px] bg-white px-[28px] py-6"
                >
                  <div className="flex items-center gap-[2px]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={18}
                        fill="#FFD54F"
                        color="#FFD54F"
                      />
                    ))}
                  </div>

                  <p className="text-black text-[16px] leading-[25px] mt-4">
                    “หาหอพักได้สะดวกง่ายขึ้น รวบรวมข้อมูลหอพักไว้ในที่เดียว
                    มีความน่าเชื่อถือ เนื่องจากเป็นหอพักที่ยืนยันโดยสถาบัน ”
                  </p>

                  <p className="text-[#FF5722] font-bold text-[14px] leading-[22px] mt-4">
                    คนสวย ที่ลาดกระบัง ปี 4, คณะเทคโนโลยีการเกษตร อาศัยที่
                    หอพักบ้านจ้อยช้างเนียม
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
