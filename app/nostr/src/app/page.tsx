import QueryForm from "./QueryForm";

export default function Home() {
  return (
    <div className="container mx-auto mt-5 px-2">
      <QueryForm initialValue={""}></QueryForm>
    </div>
  );
}
