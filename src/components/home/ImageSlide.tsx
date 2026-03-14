import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageSlide() {
  return (
    <section className="flex justify-center px-3 pt-3">
      <div className="w-full max-w-5xl">
        <Carousel>
          <CarouselContent>
            <CarouselItem>
                <img src="https://placehold.co/1280x400" className="rounded-md" alt="" />
            </CarouselItem>
            <CarouselItem>
                <img src="https://placehold.co/1280x400" className="rounded-md" alt="" />
            </CarouselItem>
            <CarouselItem>
                <img src="https://placehold.co/1280x400" className="rounded-md" alt="" />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
