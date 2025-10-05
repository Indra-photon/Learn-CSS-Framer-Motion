import Image from "next/image";
import Form from "./components/Form";

export default function Home() {
  return (

      <main className="h-screen flex-col mx-w-4xl mx-auto flex items-center justify-center">
        <Form />

        <button className="bg-black relative bottom-16 m-5 text-white px-4 py-2 rounded-md cursor-pointer w-full hover:-translate-y-1 active:scale-98
          transition-all duration-200 after:content[''] after:absolute after:opacity-0 after:-left-20 after:-top-20 after:w-1/3 after:h-[400px] after:rotate-10 after:bg-white/10
          hover:after:translate-x-full after:transition-all after:duration-200 hover:after:opacity-100" >
          Submit
        </button>
      </main>
  );
}
