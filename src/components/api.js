// api.js
export const getMusicPrediction = async (script) => {
  try {
    const response = await fetch('http://10.1.131.216:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ script }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch music prediction:', error);
    return null;
  }
};
