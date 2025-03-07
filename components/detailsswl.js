import React from "react";
import Swal from "sweetalert2";

const CampaignCell = ({ campaign }) => {
  const handleClick = () => {
    let detailsHtml = "";

    // เงื่อนไขการประกอบรายละเอียด
    if (campaign.detailsname !== null && campaign.detailsbirthdate === null) {
      detailsHtml += `<p>${campaign.detailsname}</p>`;
    }
    if (campaign.detailsname !== null && campaign.detailswish !== null) {
      detailsHtml += `<p>${campaign.detailsname}</p>`;
    }
    if (campaign.detailsbirthdate !== null) {
      detailsHtml += `<p>
        ${campaign.detailsname}<br/>
        ${campaign.detailsbirthdate} ${campaign.detailsbirthmonth} ${campaign.detailsbirthyear} เวลา 
        ${campaign.detailsbirthtime} ปี ${campaign.detailsbirthconstellation} อายุ 
        ${campaign.detailsbirthage} ปี
      </p>`;
    }
    if (campaign.detailstext !== null) {
      detailsHtml += `<p>${campaign.detailstext}</p>`;
    }
    if (campaign.details !== null) {
      detailsHtml += `<p>${campaign.details}</p>`;
    }

    // แสดง SweetAlert2 popup
    Swal.fire({
      title: "รายละเอียดแคมเปญ",
      html: detailsHtml,
      icon: "info",
      confirmButtonText: "ปิด",
    });
  };

  return (
    <td className="p-4 text-nowrap truncate-text" onClick={handleClick}>
      {campaign.detailsname !== null && campaign.detailsbirthdate === null
        ? campaign.detailsname
        : ""}
      {campaign.detailsname !== null && campaign.detailswish !== null
        ? campaign.detailsname
        : ""}
      {campaign.detailsbirthdate !== null ? (
        <>
          {campaign.detailsname}
          <br />
          {campaign.detailsbirthdate} {campaign.detailsbirthmonth}{" "}
          {campaign.detailsbirthyear} เวลา {campaign.detailsbirthtime} ปี{" "}
          {campaign.detailsbirthconstellation} อายุ {campaign.detailsbirthage} ปี
        </>
      ) : (
        ""
      )}
      {campaign.detailstext !== null ? campaign.detailstext : ""}
      {campaign.details !== null ? campaign.details : ""}
    </td>
  );
};

export default CampaignCell;
