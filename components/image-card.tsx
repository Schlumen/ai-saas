import { useState } from "react";
import Image from "next/image";
import { Card, CardFooter } from "@/components/ui/card";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loader } from "./loader";

export default function ImageCard({ src }: { src: string }) {
  const [loading, setLoading] = useState(true);

  return (
    <Card className="rounded-lg overflow-hidden">
      <div className="relative aspect-square">
        {loading && <Loader />}
        <Image
          onLoad={() => setLoading(false)}
          className="object-cover"
          alt="Image"
          fill
          src={src}
        />
      </div>
      <CardFooter className="p-2">
        <Button
          onClick={() => window.open(src, "_blank")}
          variant="secondary"
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
