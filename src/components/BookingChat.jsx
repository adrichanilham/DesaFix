import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getBooking } from '../services/bookingService.js';
import { createChatMessage, subscribeChatMessagesByBooking } from '../services/chatService.js';
import MaterialIcon from './MaterialIcon.jsx';

function BookingChat({ role }) {
  const { bookingId } = useParams();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const receiverUid = useMemo(() => {
    if (!booking || !currentUser?.uid) return '';
    return booking.customerUid === currentUser.uid ? booking.tukangUid : booking.customerUid;
  }, [booking, currentUser?.uid]);

  useEffect(() => {
    let ignore = false;
    let unsubscribe = null;

    async function loadChat() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const bookingData = await getBooking(bookingId);

        if (!bookingData) {
          throw new Error('Booking tidak ditemukan.');
        }

        const isCustomer = role === 'customer' && bookingData.customerUid === currentUser.uid;
        const isTukang = role === 'tukang' && bookingData.tukangUid === currentUser.uid;

        if (!isCustomer && !isTukang) {
          throw new Error('Anda tidak memiliki akses ke chat booking ini.');
        }

        if (!ignore) {
          setBooking(bookingData);
          unsubscribe = subscribeChatMessagesByBooking(
            bookingId,
            setMessages,
            (chatError) => {
              setError(chatError.message || 'Gagal memuat chat realtime.');
            },
          );
        }
      } catch (chatError) {
        if (!ignore) {
          setError(chatError.message || 'Gagal membuka chat.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadChat();

    return () => {
      ignore = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [bookingId, currentUser?.uid, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('Pesan tidak boleh kosong.');
      return;
    }

    if (!receiverUid) {
      setError('Penerima pesan tidak valid.');
      return;
    }

    try {
      setSending(true);
      await createChatMessage({
        bookingId,
        senderUid: currentUser.uid,
        receiverUid,
        message: message.trim(),
        imageURL: '',
        readStatus: false,
      });
      setMessage('');
    } catch (sendError) {
      setError(sendError.message || 'Gagal mengirim pesan.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat-page">
      <div className="page-panel">
        <p className="eyebrow">{role}</p>
        <h1>Chat Booking</h1>
        <p>
          {booking
            ? `Percakapan untuk booking dengan ${role === 'customer' ? booking.tukangName : booking.customerName}.`
            : 'Memuat percakapan booking.'}
        </p>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <div className="chat-box">
        <div className="chat-messages">
          {loading && <p>Memuat pesan...</p>}
          {!loading && !messages.length && <p>Belum ada pesan.</p>}
          {messages.map((chat) => {
            const ownMessage = chat.senderUid === currentUser?.uid;
            return (
              <div className={`chat-row ${ownMessage ? 'chat-row-own' : ''}`} key={chat.id}>
                <div className={`chat-bubble ${ownMessage ? 'chat-bubble-own' : ''}`}>
                  <p>{chat.message}</p>
                  {chat.imageURL && <img src={chat.imageURL} alt="Lampiran chat" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tulis pesan..."
            disabled={!booking || sending}
          />
          <button type="submit" disabled={!booking || sending}>
            <MaterialIcon name="mail" size="sm" />
            {sending ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default BookingChat;
