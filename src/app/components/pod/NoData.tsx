import Image from "next/image";

export default function NoData() {
  return (
    <div className="flex flex-col items-center mt-20">
      <Image
        src="/images/no_request.svg"
        alt="No jobs found"
        width={200}
        height={200}
        priority
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );
}
