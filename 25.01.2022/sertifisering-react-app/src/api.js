import axios from "axios";

// Legg til URL for API-et
const apiURL = "https://9njldg73dd.execute-api.us-east-1.amazonaws.com/dev";

export const getSertifiseringer = async () => {
  const respons = await axios.get(`${apiURL}/sertifiseringer`);
  return respons.data;
};

export const getSertifisering = async (id) => {
  const respons = await axios.get(`${apiURL}/sertifiseringer/${id}`);
  return respons.data;
};

export const putSertifisering = async (payload) => {
  const respons = await axios.put(`${apiURL}/sertifiseringer`, payload, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
  return respons.data;
};

export const deleteSertifisering = async (id) => {
  const respons = await axios.delete(`${apiURL}/sertifiseringer/${id}`, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
  alert(respons.data);
};

export const putBilde = async (payload) => {
  const respons = await axios.put(`${apiURL}/upload`, payload, {
    headers: {
      "Content-Type": payload.type,
      "Access-Control-Allow-Origin": "*",
      filename: payload.name,
    },
  });
  return respons.data;
};
