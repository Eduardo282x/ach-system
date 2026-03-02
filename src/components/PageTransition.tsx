import { Children, type ReactNode } from "react";

interface PageTransitionComponentProps {
    toggle: boolean;
    children: [ReactNode, ReactNode];
}

export default function PageTransitionComponent({ children, toggle }: PageTransitionComponentProps) {
    const childrenCount = Children.count(children);

    if (import.meta.env.DEV && childrenCount !== 2) {
        console.warn(`PageTransitionComponent espera exactamente 2 hijos, pero recibió ${childrenCount}.`);
    }

    const views = Children.toArray(children);
    const primaryView = views[0] ?? null;
    const secondaryView = views[1] ?? null;

    return (
        <div className="relative w-full h-full overflow-hidden">

            <div
                className={`flex w-[200%] h-full transition-transform duration-500 ease-in-out ${toggle ? '-translate-x-1/2' : 'translate-x-0'}`}
            >

                <div className="w-1/2 shrink-0 h-full overflow-auto">{primaryView}</div>

                <div className="w-1/2 shrink-0 h-full overflow-auto">{secondaryView}</div>

            </div>

        </div>
    );
}