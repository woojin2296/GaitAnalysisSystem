import { SerialPort } from 'serialport';

export async function GET() {
  try {
    let serialPort: SerialPort | undefined;

    if (!serialPort || !serialPort.isOpen) {
      serialPort = new SerialPort({
        path: '/dev/cu.usbmodem1101', // 실제 장치 경로 확인 필요
        baudRate: 9600,
      });

      serialPort.on('error', (err) => {
        console.error('Serial Port Error:', err.message);
      });
    }

    console.log('Client connected');

    const stream = new ReadableStream({
      start(controller) {
        serialPort?.on('data', (data) => {
          const parsedData = data.toString('utf-8').trim();
          console.log(`Sending data: ${parsedData}`);
          controller.enqueue(`data: ${parsedData}\n\n`); // SSE 응답 형식
        });
      },
      cancel() {
        console.log('Stream closed by client');
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*', // CORS 허용
      },
    });
  } catch (error: any) {
    console.error('Error in API:', error.message);
    return new Response(`data: error - ${error.message}\n\n`, {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }
}