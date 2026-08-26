# TaskPro AI Trainer (From Scratch)

This project contains a completely from-scratch implementation of a Transformer neural network built purely in PyTorch. It is designed for educational purposes to understand how Large Language Models (LLMs) learn and generate text.

## Structure
- `model.py`: The architecture of the AI (Self-Attention, Transformer Blocks, Linear Layers).
- `data_loader.py`: Handles tokenizing raw text and batching it for the neural network.
- `train.py`: The training loop. Feeds data through the network, calculates loss, and updates weights via Backpropagation.
- `generate.py`: The inference script to test your trained model.
- `dataset/sample_data.jsonl`: The raw data the AI will learn from.

## How to Run

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Train the Model**
   Run the training script. It will read the dataset, train the network for 100 epochs, and save the learned weights to `minigpt_model.pt`.
   ```bash
   python train.py
   ```

3. **Test the Model**
   Once training is complete, test the AI by asking it a question.
   ```bash
   python generate.py
   ```

## Customizing the Data
Open `dataset/sample_data.jsonl` and add as many examples as you'd like. The format is a JSON object with a single `"text"` key containing the Question and Answer. The more data you provide, the smarter the AI will become!
