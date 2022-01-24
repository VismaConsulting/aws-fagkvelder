import axios from "axios";

const apiURL = "https://iyoqsruif3.execute-api.us-east-1.amazonaws.com/dev";

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

export const deleteSertifisering = async (id, onFinish) => {
  const respons = await axios.delete(`${apiURL}/sertifiseringer/${id}`, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
  alert(respons.data);
  onFinish(id);
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
