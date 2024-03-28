import { useState, useEffect } from "react";
import Header from "./components/Header";
import File from "./components/File";
import Footer from "./components/Footer";
import generateMessage from "./utilities/generateMessage";
import "./styles.css";
import { detect } from "detect-browser";

export default function App({ serverGeneratedFileId }) {
  const [userData, setUserData] = useState({
    userId: crypto.randomUUID(),
    downloadRequested: false,
    downloadTimeStamp: undefined,
    requestedFileId: undefined,
    browser: undefined,
    location: { ip: undefined, city: undefined, country: undefined },
  });

  if (userData.downloadRequested) {
    generateMessage(userData);
  }

  useEffect(() => {
    if (userData.downloadRequested) {
      throw Error("userID değişti :-(");
    }
  }, [userData.userId]);

  /* Challenge

	Bu dosya için indirme sayfasının bir indirme butonuna ihtiyacı var. Göreviniz aşağıdaki gibi bir tane oluşturmaktır: 
      
      	1. Kullanıcı aşağıdaki 67. satırdaki "İndir" butonuna tıkladığında, buton devre dışı kalmalı ve userData state'i aşağıdaki gibi güncellenmelidir: 
		   
           	        Özellik		 	  Değer(ler)	  
			     ╷---------------------╷-----------------------------------------------------------╷
			     |  userId             |  önceki userData state'inin userId değerini korur         |
			     |---------------------|-----------------------------------------------------------|
		  	   |  downloadRequested  |  true                                             				 |
			     |---------------------|-----------------------------------------------------------|
			     |  downloadTimeStamp  |  localeString'e dönüştürülmüş yeni bir Date nesnesi       |
			     |---------------------|-----------------------------------------------------------|
			   	 |  requestedFileId    |  indirme butonunda veri olarak saklanan dosya ID'si       |
           |---------------------|-----------------------------------------------------------|
			     |  browser            |  detect fonksiyonunun return değeri 		                   |
				   |					           |      (zaten bu dosyaya aktarılmış)						             |
           |---------------------|-----------------------------------------------------------|
			     |  location      		 |  aşağıdaki özelliklere sahip bir nesne:	  		           |
			     |					           |  - ip: kullanıcının IP adresi				                     |
				   |					           |	 - city: kullanıcının şehir adı					                 |
				   |					           |	 - country: kullanıcının ülkesinin adı		    	         |
           |                     |       													                           |
			     ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
		 	2. Yukarıdakiler dışında, kodda başka hiçbir şeyin değiştirilmesine veya eklenmesine gerek yoktur. Bu görevleri başarıyla tamamlarsanız, konsolda doğru şekilde işlenmiş bir mesaj görmeniz ve butonun tıkladıktan sonra silik ve tıklanamaz hale gelmesi gerekir. 
*/

  const API_KEY_GOOGLE = "AIzaSyAsHfqyC5x921wufVGM7Lr5ugfvG-rf6lk";

  const [userAddress, setUserAddress] = useState({ city: null, country: null });
  const [userIPAddress, setuserIPAddress] = useState(null);

  useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setuserIPAddress(data.ip);
      } catch (error) {
        // console.log(error);
      }
    };

    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const getLocationData = async () => {
        try {
          const rest = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY_GOOGLE}`
          );
          const data = await rest.json();
          let addressArr = data.results[10].formatted_address.split(",");
          setUserAddress({ city: addressArr[0], country: addressArr[1] });
          // console.log(data);
          // console.log(userAddress);
        } catch (error) {
          console.log(error);
        }
      };

      getLocationData();
      fetchIPAddress();
    });
  }, []);

  const [downloadClicked, setDownloadClicked] = useState(false);
  const handleClick = (e) => {
    setDownloadClicked(true);
    // console.log(e);
    console.log(e.target.dataset.fileId);

    setUserData({
      ...userData,
      downloadRequested: true,
      downloadTimeStamp: new Date().toLocaleString(),
      requestedFileId: e.target.getAttribute("data-file-id"),
      browser: detect(),
      location: {
        ip: userIPAddress,
        city: userAddress.city,
        country: userAddress.country,
      },
    });
  };

  return (
    <div>
      <Header />
      <main>
        <File />
        <div>
          <button
            className="download-button"
            data-file-id={serverGeneratedFileId}
            onClick={handleClick}
            disabled={downloadClicked ? true : false}
          >
            İndir
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
