
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
} from 'react-bootstrap';

interface EventData {
  eventID: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  visibility: 'public' | 'friends' | 'private';
}

interface Friend {
  friendshipID: number;
  userID: number;
  name: string;
  username: string;
}

interface EditEventProps {
  event: EventData;
  friends: Friend[];
  onUpdateEvent: (updatedEvent: {
    eventID: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    visibility: string;
  }) => void | Promise<void>;
  onShareEvent: (
    eventID: number,
    friendshipIDs: number[]
  ) => void | Promise<void>;
}

// Convert a MariaDB datetime into a datetime-local input value.
function toDateTimeLocal(value: string) {
  return value.replace(' ', 'T').slice(0, 16);
}

function EditEventForm({
  event,
  friends,
  onUpdateEvent,
  onShareEvent,
}: EditEventProps) {
  const [title, setTitle] = useState(event.title ?? '');
  const [description, setDescription] = useState(
    event.description ?? ''
  );
  const [startTime, setStartTime] = useState(
    toDateTimeLocal(event.start_time)
  );
  const [endTime, setEndTime] = useState(
    toDateTimeLocal(event.end_time)
  );
  const [visibility, setVisibility] = useState(event.visibility);

  const [selectedFriends, setSelectedFriends] = useState<number[]>(
    []
  );

  // Reset the form when a different event is selected.
  useEffect(() => {
    setTitle(event.title ?? '');
    setDescription(event.description ?? '');
    setStartTime(toDateTimeLocal(event.start_time));
    setEndTime(toDateTimeLocal(event.end_time));
    setVisibility(event.visibility);
    setSelectedFriends([]);
  }, [event]);

  const toggleFriend = (friendshipID: number) => {
    setSelectedFriends((current) =>
      current.includes(friendshipID)
        ? current.filter((id) => id !== friendshipID)
        : [...current, friendshipID]
    );
  };

  const handleUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    await onUpdateEvent({
      eventID: event.eventID,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      visibility,
    });
  };

  const handleShare = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (visibility !== 'private') return;
    if (selectedFriends.length === 0) return;

    await onShareEvent(event.eventID, selectedFriends);
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Edit Event</Card.Title>

        {/* SECTION 1: Edit event details */}
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3" controlId="eventTitle">
            <Form.Label>Event Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="eventDescription"
          >
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId="eventStartTime"
              >
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group
                className="mb-3"
                controlId="eventEndTime"
              >
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={endTime}
                  min={startTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="eventVisibility">
            <Form.Label>Visibility</Form.Label>
            <Form.Select
              value={visibility}
              onChange={(e) =>
                setVisibility(
                  e.target.value as EventData['visibility']
                )
              }
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary">
            Update Event
          </Button>
        </Form>

        {/* Divider between editing and sharing */}
        {visibility === 'private' && (
          <>
            <hr className="my-4" />

            {/* SECTION 2: Share a private event */}
            <h5>Share Private Event with Friends</h5>
            <p className="text-muted">
              Select the friends who can see this private event.
              They will be able to see its time, but its title and
              description will remain hidden.
            </p>

            <Form onSubmit={handleShare}>
              {friends.length === 0 ? (
                <p>You don't have any friends to share with.</p>
              ) : (
                <div className="mb-3">
                  {friends.map((friend) => (
                    <Form.Check
                      key={friend.friendshipID}
                      type="checkbox"
                      id={`friend-${friend.friendshipID}`}
                      label={`${friend.name} (${friend.username})`}
                      checked={selectedFriends.includes(
                        friend.friendshipID
                      )}
                      onChange={() =>
                        toggleFriend(friend.friendshipID)
                      }
                      className="mb-2"
                    />
                  ))}
                </div>
              )}

              <Button
                type="submit"
                variant="success"
                disabled={selectedFriends.length === 0}
              >
                Share with Selected Friends
              </Button>
            </Form>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default EditEventForm;