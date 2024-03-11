import Image from "next/image";

interface EmptyProps {
  label: string;
  imagePath: string;
}

export const Empty = ({ label, imagePath }: EmptyProps) => {
  return (
    <div className="h-full p-20 flex flex-col items-center justify-center">
      <div className="relative h-72 w-72 rounded-xl shadow-xl overflow-hidden">
        <Image alt="Empty" fill src={imagePath} />
      </div>
      <p className="text-muted-foreground text-sm text-center mt-5">{label}</p>
    </div>
  );
};
