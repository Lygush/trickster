// Общие стили для PhoneView мини-игр
export const ui = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100%', padding: '14px 16px 18px', gap: 14, animation: 'fadeIn 0.35s ease',
  },
  center: { justifyContent: 'center' },
  card: {
    width: '100%', background: 'rgba(4,12,5,0.88)', border: '1px solid #2a4a20',
    borderRadius: 14, padding: '14px 16px',
  },
  prompt: {
    width: '100%', fontFamily: "'Cinzel', serif", fontSize: 'clamp(15px, 4.2vw, 19px)', color: '#e8f5d0',
    textAlign: 'center', lineHeight: 1.45, background: 'rgba(4,12,5,0.88)', border: '1px solid rgba(212,175,55,.3)',
    borderRadius: 14, padding: '14px',
  },
  label: { fontSize: 12, color: '#7aaa50', letterSpacing: 2, textTransform: 'uppercase' },
  hint: { fontSize: 13, color: '#8acc50', textAlign: 'center', animation: 'pulse 1.6s infinite' },
  goldBtn: {
    width: '100%', fontFamily: "'Cinzel', serif", fontSize: 15, letterSpacing: 1,
    color: '#040c05', background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none', borderRadius: 30, padding: '14px', cursor: 'pointer', transition: 'opacity .2s',
  },
  playerBtn: {
    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
    background: 'rgba(10,22,10,0.88)', border: '1.5px solid #2a4a20', borderRadius: 14,
    padding: '13px 16px', cursor: 'pointer', color: '#d8f0b0', textAlign: 'left',
    transition: 'border-color .2s, background .2s, opacity .2s',
  },
  playerBtnChosen: { borderColor: '#c8a830', background: 'rgba(30,25,4,0.95)', boxShadow: '0 0 16px rgba(200,168,48,.2)' },
  playerName: { fontFamily: "'Cinzel', serif", fontSize: 16, flex: 1 },
  check: {
    width: 60, height: 60, borderRadius: '50%', background: 'rgba(10,30,10,0.9)', border: '2px solid #5a9a30',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#8acc40',
    animation: 'bounceIn .4s ease',
  },
  big: { fontFamily: "'Cinzel', serif", fontSize: 20, color: '#f0d060', textAlign: 'center' },
};
