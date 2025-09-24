import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BookingCard from '../BookingCard';

const mockBooking = {
  _id: '123',
  customerName: 'John Doe',
  carDetails: {
    year: 2020,
    make: 'Toyota',
    model: 'Camry',
    type: 'sedan'
  },
  serviceType: 'Basic Wash',
  status: 'Pending',
  date: '2024-01-15',
  timeSlot: '10:00-11:00',
  price: 25.99,
  duration: 30,
  addOns: ['Interior Cleaning'],
  rating: 4
};

describe('BookingCard Component', () => {
  const mockHandlers = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders booking information correctly', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('sedan')).toBeInTheDocument();
    expect(screen.getByText('Basic Wash')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('displays add-ons when present', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    expect(screen.getByText('Interior Cleaning')).toBeInTheDocument();
  });

  it('shows rating for completed bookings', () => {
    const completedBooking = { ...mockBooking, status: 'Completed' };
    render(<BookingCard booking={completedBooking} {...mockHandlers} />);
    
    expect(screen.getByText('Rating:')).toBeInTheDocument();
  });

  it('handles view button click', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('View Details'));
    expect(mockHandlers.onView).toHaveBeenCalledWith('123');
  });

  it('handles edit button click', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('123');
  });

  it('handles delete button click', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('123');
  });

  it('handles card click when onClick is provided', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    const card = screen.getByLabelText(/Booking for John Doe/);
    fireEvent.click(card);
    expect(mockHandlers.onClick).toHaveBeenCalledWith(mockBooking);
  });

  it('handles keyboard navigation when clickable', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    const card = screen.getByLabelText(/Booking for John Doe/);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockHandlers.onClick).toHaveBeenCalledWith(mockBooking);
    
    vi.clearAllMocks();
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockHandlers.onClick).toHaveBeenCalledWith(mockBooking);
  });

  it('applies correct status badge colors', () => {
    const pendingBooking = { ...mockBooking, status: 'Pending' };
    render(<BookingCard booking={pendingBooking} {...mockHandlers} />);
    
    const statusBadge = screen.getByText('Pending');
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('does not trigger card click when clicking action buttons', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockHandlers.onClick).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<BookingCard booking={mockBooking} {...mockHandlers} />);
    
    const card = screen.getByLabelText(/Booking for John Doe/);
    expect(card).toHaveAttribute('aria-label');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});