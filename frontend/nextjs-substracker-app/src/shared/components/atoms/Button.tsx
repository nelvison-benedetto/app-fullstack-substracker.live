import { ButtonHTMLAttributes } from "react";
import {variants, sizes} from "@/shared/constants/variants";

type ButtonVariant = "default" | "outline" | "ghost" | "danger";
type ButtonSize = "base" | "xs" | "sm" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
};

export default function Button({
    variant = "default",
    size = "base",
    children,
    className,
    ...props
} : ButtonProps){
    return (
        <button {...props} className={`${variants[variant]} ${sizes[size]} ${className?? ""} `} >
            {children}
        </button>
    );
}