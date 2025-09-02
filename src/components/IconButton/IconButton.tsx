interface IconButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export function IconButton({children, onClick}: IconButtonProps) {
    return (
        <div onClick={onClick} className="p-1 w-8 h-8 hover:bg-blue-500 cursor-pointer rounded-full">
            {children}
        </div>
    )
}