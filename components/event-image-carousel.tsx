import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface EventImageCarouselProps {
  images: { src: string; alt: string }[];
}

export default function EventImageCarousel({ images }: EventImageCarouselProps) {
  return (
    <Card className="mb-8 overflow-hidden border-none bg-transparent shadow-none">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl md:h-[400px]">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt || `Event Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </Card>
  );
}
