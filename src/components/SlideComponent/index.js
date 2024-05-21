import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import bgImage1 from "../../assets/images/1.jpeg"
import bgImage2 from "../../assets/images/2.jpeg"
import bgImage3 from "../../assets/images/3.jpeg"
import bgImage4 from "../../assets/images/4.jpeg"
import bgImage5 from "../../assets/images/5.jpeg"
import bgImage6 from "../../assets/images/6.jpeg"
const SlideComponent = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    arrows: false,
  };

  return (
    <Slider {...settings}>
      <div>
        <img
          src={bgImage1}
          alt=""
          style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
        />
      </div>
      <div>
        <img
          src={bgImage2}
          alt=""
          style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
        />
      </div>
      <div>
        <img
          src={bgImage3}
          alt=""
          style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
        />
      </div>
      <div>
        <img
          src={bgImage4}
          alt=""
          style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
        />
      </div>
      <div>
        <img
          src={bgImage5}
          alt=""
          style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
        />
      </div>
      <div>
        <img
          src={bgImage6}
          alt=""
          style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
        />
      </div>
    </Slider>
  );
};

export default SlideComponent;
