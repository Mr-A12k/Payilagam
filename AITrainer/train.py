import torch
from torch.optim import AdamW
from tqdm import tqdm
from model import MiniGPT, MiniGPTConfig
from data_loader import get_dataloader

def train():
    # Hyperparameters
    block_size = 64
    batch_size = 4
    learning_rate = 3e-4
    epochs = 100
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    print(f"Using device: {device}")

    # Prepare Data
    jsonl_path = 'dataset/sample_data.jsonl'
    dataloader, vocab_size = get_dataloader(jsonl_path, block_size, batch_size)

    # Initialize Model
    config = MiniGPTConfig(
        vocab_size=vocab_size,
        block_size=block_size,
        n_layer=4,
        n_head=4,
        n_embd=128
    )
    model = MiniGPT(config)
    model.to(device)

    # Optimizer
    optimizer = AdamW(model.parameters(), lr=learning_rate)

    print(f"Model initialized with {sum(p.numel() for p in model.parameters())} parameters.")
    print("Starting training...")

    model.train()
    for epoch in range(epochs):
        total_loss = 0
        progress_bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{epochs}")
        
        for batch_idx, (x, y) in enumerate(progress_bar):
            x, y = x.to(device), y.to(device)

            # Forward pass
            logits, loss = model(x, targets=y)

            # Backward pass
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            # Update weights
            optimizer.step()

            total_loss += loss.item()
            progress_bar.set_postfix({'loss': f"{loss.item():.4f}"})

        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1} completed. Average Loss: {avg_loss:.4f}")

    # Save the trained model
    torch.save(model.state_dict(), 'minigpt_model.pt')
    print("Training complete! Model saved to minigpt_model.pt")

if __name__ == '__main__':
    train()
