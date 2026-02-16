const LENGTH = 3;

export default function StackedComponent() {
  return (

    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100">
    <div className="wrapper grid ">
      {new Array(LENGTH).fill(0).map((_, i) => (
        <div
            className="card"
            key={i}
            style={{
            width: '356px',
            height: '74px',
            boxShadow: '0 4px 12px #0000001a',
            border: '1px solid #eeeeee',
            background: 'white',
            borderRadius: '8px',
            gridArea: '1 / 1',
            transform: `translateY(${i * (13)}%) scale(${1 + i * 0.04})`,
            }}
        />
      ))}
    </div>
    </div>
  );
}