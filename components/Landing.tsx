import type { Business } from "@/data/business-helpers";
import Navbar from "./Navbar";
import Hero from "./Hero";
import QualityGallery from "./QualityGallery";
import BeforeAfter from "./BeforeAfter";
import Inventory from "./Inventory";
import Warranty from "./Warranty";
import Location from "./Location";
import About from "./About";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import LandingSpain from "./spain/LandingSpain";
import LandingMexico from "./mexico/LandingMexico";
import LandingArgentina from "./argentina/LandingArgentina";

export default function Landing({ biz }: { biz: Business }) {
  if (biz.pais === "ES" || biz.template === "spain") {
    return <LandingSpain biz={biz} />;
  }

  if (biz.pais === "MX" || biz.template === "mexico") {
    return <LandingMexico biz={biz} />;
  }

  if (biz.pais === "AR" || biz.template === "argentina" || biz.slug === "gli-stance") {
    return <LandingArgentina biz={biz} />;
  }

  const isCustom = Boolean(biz.servicios && biz.servicios.length > 0);

  return (
    <>
      <Navbar biz={biz} />
      <Hero biz={biz} />
      <QualityGallery biz={biz} />
      {!isCustom && <BeforeAfter />}
      <Inventory biz={biz} />
      <Warranty />
      <Location biz={biz} />
      <About biz={biz} />
      <Footer biz={biz} />
      <WhatsAppFloat biz={biz} />
    </>
  );
}
