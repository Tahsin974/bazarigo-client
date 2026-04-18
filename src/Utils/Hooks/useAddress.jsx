import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

export default function useAddress(division = '', district = '') {
  const axiosPublic = useAxiosPublic();

  // ── Divisions — fetched once, cached forever ──────────────────────────────
  const {
    data: divisions = [],
    isLoading: divisionsLoading,
  } = useQuery({
    queryKey: ["divisions"],
    queryFn: async () => {
      const res = await axiosPublic.get("/address/divisions");
      return res.data.data;
    },
    staleTime: Infinity,
  });

  // ── Districts — only fires when division is selected ──────────────────────
  const {
    data: districts = [],
    isLoading: districtsLoading,
  } = useQuery({
    queryKey: ["districts", division],
    queryFn: async () => {
      const res = await axiosPublic.get("/address/districts", {
        params: { division },
      });
      return res.data.data;
    },
    enabled: !!division,    // won't run until division has a value
    staleTime: Infinity,
  });

  // ── Thanas — only fires when both division + district are selected ─────────
  const {
    data: thanas = [],
    isLoading: thanasLoading,
  } = useQuery({
    queryKey: ["thanas", division, district],
    queryFn: async () => {
      const res = await axiosPublic.get("/address/thanas", {
        params: { division, district },
      });
      return res.data.data;
    },
    enabled: !!division && !!district,  // won't run until both have values
    staleTime: Infinity,
  });

  return {
    divisions,
    divisionsLoading,
    districts,
    districtsLoading,
    thanas,
    thanasLoading,
  };
}