const RoomCard = ({ room, onEdit, onDelete }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h4>{room.roomNumber}</h4>
      <p>Floor: {room.floor} | Type: {room.type}</p>
      <p>Occupancy: {room.occupants.length}/{room.capacity}</p>
      <p>Status: {room.status}</p>
      <button onClick={() => onEdit(room)}>Edit</button>
      <button onClick={() => onDelete(room._id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
    </div>
  );
};

export default RoomCard;