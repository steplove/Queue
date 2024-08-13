import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BASE_URL } from "../../constants/constants";

const SlideComponent = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(BASE_URL + "/api/images")
      .then((response) => response.json())
      .then((data) => setImages(data))
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

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
      {images.map((image, index) => (
        <div key={index}>
          <img
            src={image}
            alt=""
            style={{ width: "100%", height: "82vh", objectFit: "scale-down" }}
          />
        </div>
      ))}
    </Slider>
  );
};

export default SlideComponent;
