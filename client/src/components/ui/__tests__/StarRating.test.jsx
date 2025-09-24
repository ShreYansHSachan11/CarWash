import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StarRating from '../StarRating';

describe('StarRating Component', () => {
  it('renders 5 stars', () => {
    render(<StarRating rating={0} />);
    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(5);
  });

  it('displays correct rating', () => {
    render(<StarRating rating={3} readOnly />);
    const container = screen.getByRole('img');
    expect(container).toHaveAttribute('aria-label', 'Rating: 3 out of 5 stars');
  });

  it('handles rating changes', () => {
    const handleRatingChange = vi.fn();
    render(<StarRating rating={0} onRatingChange={handleRatingChange} />);
    
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    fireEvent.click(thirdStar);
    
    expect(handleRatingChange).toHaveBeenCalledWith(3);
  });

  it('shows hover effects on interactive stars', () => {
    const handleRatingChange = vi.fn();
    render(<StarRating rating={0} onRatingChange={handleRatingChange} />);
    
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    fireEvent.mouseEnter(thirdStar);
    
    // Check if hover state is applied (stars should have yellow color)
    expect(thirdStar).toHaveClass('text-yellow-400');
  });

  it('does not allow interaction when readOnly', () => {
    const handleRatingChange = vi.fn();
    render(<StarRating rating={3} readOnly onRatingChange={handleRatingChange} />);
    
    const stars = screen.getAllByRole('presentation');
    fireEvent.click(stars[0]);
    
    expect(handleRatingChange).not.toHaveBeenCalled();
  });

  it('displays rating text when rating exists', () => {
    render(<StarRating rating={4} readOnly />);
    expect(screen.getByText('(4/5)')).toBeInTheDocument();
  });

  it('applies correct ARIA attributes for interactive mode', () => {
    render(<StarRating rating={0} onRatingChange={vi.fn()} />);
    const container = screen.getByRole('radiogroup');
    expect(container).toHaveAttribute('aria-label', 'Rate this service');
  });

  it('applies correct ARIA attributes for read-only mode', () => {
    render(<StarRating rating={3} readOnly />);
    const container = screen.getByRole('img');
    expect(container).toHaveAttribute('aria-label', 'Rating: 3 out of 5 stars');
  });
});