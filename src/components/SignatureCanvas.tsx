import React, { useRef, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';

interface SignatureCanvasProps {
  onSave: (signature: string) => void;
  onClear: () => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSave, onClear }) => {
  const signaturePad = useRef<SignaturePad>(null);

  const clear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      onClear();
    }
  };

  const save = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const signatureData = signaturePad.current.toDataURL('image/png');
      if (signatureData && signatureData.length > 0) {
        onSave(signatureData);
      }
    }
  };

  useEffect(() => {
    const resizeCanvas = () => {
      if (signaturePad.current) {
        const canvas = signaturePad.current.getCanvas();
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signaturePad.current.clear();
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="relative">
      <SignaturePad
        ref={signaturePad}
        canvasProps={{
          className: "border rounded-md w-full h-48 bg-white",
        }}
      />
      <div className="absolute bottom-2 right-2 space-x-2">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          Löschen
        </button>
        <button
          type="button"
          onClick={save}
          className="px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded"
        >
          Unterschrift verwenden
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas;