import { SectionCards } from "@/components/section-cards";
import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Dashboard() {
    const { getSession, user, sessionLoading } = useAuth();

    useEffect(() => {
        getSession();
    }, []);

    if (sessionLoading) {
        return (
            <div className="flex justify-center items-center flex-1">
                <Spinner />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center flex-1">
                Not logged in
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards />
                </div>
            </div>
        </div>
    );
}
