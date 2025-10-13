import { DataTable } from "@/components/data-table";
import useUser from "@/hooks/useUser";
import { useMemo, useEffect, useRef } from "react";

export default function Team() {
  const { data, error, isFetching } = useUser();
  const renderCount = useRef(0);
  
  // Track render count to debug infinite renders
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Team component render #${renderCount.current}`);
    if (renderCount.current > 5) {
      console.warn("Too many renders detected - possible infinite loop!");
    }
  });

  // ✅ Memoize data to prevent re-renders
  const users = useMemo(() => {
    console.log("Memoizing users data:", data?.data?.users);
    return data?.data?.users ?? [];
  }, [data]);

  console.log("Team render - isFetching:", isFetching, "users length:", users.length, "error:", error);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable 
            data={users} 
            isLoading={isFetching}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
