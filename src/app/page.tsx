import UploadZone from "@/components/UploadZone";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Pregătește fișierele pentru print
        </h2>
        <p className="text-muted">
          Încarcă un fișier JPG, PNG sau PDF pentru a începe
        </p>
      </div>
      <UploadZone />
    </div>
  );
}
