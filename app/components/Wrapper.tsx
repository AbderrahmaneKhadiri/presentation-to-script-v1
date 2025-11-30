"use client";
import { Navbar } from "./Navbar";
import { usePathname } from "next/navigation";

type WrapperProps = {
    children: React.ReactNode
}

const Wrapper = ({ children }: WrapperProps) => {
    const pathname = usePathname();
    const applyPadding = pathname !== '/';

    return (
        <>
            <Navbar />
            <div className={applyPadding ? "px-5 md:px-[10%] pt-28 mb-10" : ""}>
                {children}
            </div>
        </>
    )
}

export default Wrapper;