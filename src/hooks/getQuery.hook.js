import toast from "react-hot-toast";
import apiClient from "../apis/apiClient";

import { useState } from "react";
import { logger } from "../utils/logger";

const useGetQuery = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  const getQuery = async (params) => {
    const {
      url,
      onSuccess = () => {
        logger.log("onSuccess function");
      },
      onFail = () => {
        logger.log("onFail function");
      },
    } = params;
    setLoading(true);
    try {
      const { data: apiData = {} } = await apiClient.get(url);
      setData(apiData);
      await onSuccess(apiData);
      return apiData;
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          err?.data?.message ||
          err?.data?.data?.message ||
          "Something went wrong"
      );
      onFail(err);
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getQuery,
    loading,
    setLoading,
    data,
    setData,
    error,
    setError,
  };
};

export default useGetQuery;
