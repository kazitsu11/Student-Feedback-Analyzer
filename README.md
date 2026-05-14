# Student Feedback Analyzer

A robust full-stack application designed to analyze and evaluate student feedback using AI and natural language processing. Originally built as a hackathon project, this system features a modular architecture to process feedback, evaluate sentiment and content, and visualize accuracy and performance metrics via a premium React dashboard.

## 🚀 Features

- **AI-Powered Evaluation**: Utilizes OpenAI's GPT models to intelligently parse and evaluate qualitative student feedback.
- **Sentiment Analysis**: Built-in sentiment scoring in the Node.js backend to quickly identify positive and negative trends.
- **Evaluation Pipeline**: A dedicated Python orchestration service to calculate accuracy and performance metrics against a golden dataset.
- **Premium Dashboard**: A responsive, high-performance React UI built with Vite for visualizing the results.
- **Modular Architecture**: Clean separation of concerns between the frontend (React), backend proxy/API (Node.js/Express), and the AI orchestration layer (Python/FastAPI).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Utilities**: `sentiment` for local text analysis

### Orchestration Service
- **Language**: Python 3
- **Framework**: FastAPI with Uvicorn
- **AI Integration**: OpenAI SDK (`openai`)
- **Evaluation**: Custom pipeline using `evaluate.py` and `pipeline.py` against a `golden_dataset.json`

## 📦 Project Structure

```text
Student-Feedback-Analyzer/
├── backend/          # Node.js/Express backend service
├── frontend/         # React/Vite web application
└── orchestration/    # Python/FastAPI AI evaluation pipeline
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.9+
- MongoDB instance (local or Atlas)
- OpenAI API Key

### 1. Orchestration Service Setup (Python)
Navigate to the `orchestration` directory and install dependencies:
```bash
cd orchestration
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `orchestration` directory and add your OpenAI API Key:
```env
OPENAI_API_KEY=your_api_key_here
```

Run the FastAPI server:
```bash
uvicorn main:app --reload
```

### 2. Backend Setup (Node.js)
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with your database URI and other configurations:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup (React/Vite)
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

## 📊 Evaluation Module
The project includes a robust evaluation module in the `orchestration/` folder. It uses `golden_dataset.json` to benchmark the AI model's performance on feedback analysis. 
You can run the evaluation pipeline by executing:
```bash
cd orchestration
python evaluate.py
```

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.
