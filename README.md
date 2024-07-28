# Ask To PDF App

This application allows users to upload a PDF and ask questions about its content using OpenAI's language model.

## Analyze PDF Files with Python, Streamlit and OpenAI Technologies

This is a time-saving artificial intelligence application for those who do not have time to review the entire PDF content, where the user can ask questions about the PDF content they upload and receive answers according to the content.

## Demo

Check out the live demo: [Ask To PDF](https://asktopdf.streamlit.app/)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ask-to-pdf.git
    cd ask-to-pdf
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up the Python environment:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

4. Create a `.env` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_openai_api_key
    ```

## Usage

1. Start the Flask server:
    ```sh
    python app.py
    ```

2. Start the Electron application:
    ```sh
    npm start
    ```

## Building

To build the application for different platforms, use the following commands:

- For Windows:
    ```sh
    npm run build:win
    ```

- For macOS:
    ```sh
    npm run build:mac
    ```

- For Linux:
    ```sh
    npm run build:linux
    ```

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License.