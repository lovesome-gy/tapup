import { useState } from 'react'
import './App.css'

const PERSON_TAGS = ['교수님', '부모님', '팀플 인원', '직장 동료', '상사', '학생', '애인', '친구']
const SITUATION_MAP = {
  '교수님': ['출결 문의', '과제 문의', '성적 이의신청', '병결 신청', '인삿말', '온라인 여부'],
  '부모님': ['귀가 알림', '용돈 요청', '근황 공유', '인삿말', '약속 취소'],
  '팀플 인원': ['회의 공지', '자료 요청', '일정 변경', '독촉', '역할 분담'],
  '직장 동료': ['업무 요청', '일정 공유', '회의 안내', '협조 요청', '감사 인사'],
  '상사': ['보고', '휴가 신청', '업무 문의', '사과', '승인 요청'],
  '학생': ['과제 안내', '성적 공지', '상담 일정', '출석 확인'],
  '애인': ['약속 잡기', '사과', '감사 표현', '근황 공유', '취소 알림'],
  '친구': ['약속 잡기', '생일 축하', '위로', '부탁', '거절'],
}
const DEFAULT_SITUATIONS = ['문의', '인삿말', '사과', '감사', '거절', '공지']

const MEDIA_OPTIONS = [
  { label: '전화로', icon: '/icon4.png' },
  { label: '문자로', icon: '/icon1.png' },
  { label: '대면으로', icon: '/icon3.png' },
  { label: '메일로', icon: '/icon5.png' },
]

// STEP: home | person | situation | media | result
export default function App() {
  const [step, setStep] = useState('home')
  const [person, setPerson] = useState('')
  const [situation, setSituation] = useState('')
  const [media, setMedia] = useState('')
  const [customPerson, setCustomPerson] = useState('')
  const [customSituation, setCustomSituation] = useState('')
  const [showCustomPerson, setShowCustomPerson] = useState(false)
  const [showCustomSituation, setShowCustomSituation] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const finalPerson = showCustomPerson ? customPerson : person
  const situations = SITUATION_MAP[person] || DEFAULT_SITUATIONS

  const generate = async (selectedMedia) => {
    setLoading(true)
    setResult(null)
    setStep('result')
    const finalSituation = showCustomSituation ? customSituation : situation

    const prompt = `당신은 한국어 커뮤니케이션 전문가입니다.
아래 키워드를 기반으로 실제로 바로 사용할 수 있는 완성형 메시지를 작성해주세요.

인물: ${finalPerson}
상황: ${finalSituation}
매체: ${selectedMedia}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "message": "완성된 메시지 전체 (줄바꿈은 \\n으로 표현)",
  "reasons": [
    { "part": "메시지에서 특징적인 표현", "reason": "이 표현을 선택한 이유" },
    { "part": "메시지에서 특징적인 표현2", "reason": "이 표현을 선택한 이유2" }
  ]
}`

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      const data = await response.json()
      const text = data.candidates[0].content.parts[0].text.trim()
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
    } catch (e) {
      console.error(e)
      setResult({ error: true })
    }
    setLoading(false)
  }

  const handleMediaSelect = (label) => {
    setMedia(label)
    generate(label)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setStep('home')
    setPerson('')
    setSituation('')
    setMedia('')
    setCustomPerson('')
    setCustomSituation('')
    setShowCustomPerson(false)
    setShowCustomSituation(false)
    setResult(null)
    setCopied(false)
  }

  // ── HOME ──────────────────────────────────────────
  if (step === 'home') return (
    <div className="screen home-screen">
      <div className="home-blob blob1" />
      <div className="home-blob blob2" />
      <div className="home-blob blob3" />
      <div className="home-content">
        <h1 className="home-title">
          망설여지는 순간,<br />
          탭 하세요! <span className="robot">🤖</span>
        </h1>
      </div>
      <div className="home-bottom">
        <img src="/logo.png" alt="tap up" className="logo-img" />
        <button className="btn-primary" onClick={() => setStep('person')}>
          키워드로 문장 생성하기
        </button>
      </div>
    </div>
  )

  // ── PERSON ────────────────────────────────────────
  if (step === 'person') return (
    <div className="screen step-screen">
      <button className="back-btn" onClick={reset}>‹</button>
      <div className="step-top">
        <h2 className="step-title">
          <span className="step-icon">🧑</span>
          <span className="highlight">인물 키워드</span>를<br />골라주세요
        </h2>
      </div>
      <div className="tag-area">
        {showCustomPerson ? (
          <div className="custom-input-wrap">
            <input
              autoFocus
              className="custom-input"
              placeholder="직접 입력하세요"
              value={customPerson}
              onChange={e => setCustomPerson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && customPerson && setStep('situation')}
            />
            <button
              className={`btn-next ${customPerson ? 'active' : ''}`}
              onClick={() => customPerson && setStep('situation')}
            >다음</button>
          </div>
        ) : (
          <div className="tags-wrap">
            {PERSON_TAGS.map(tag => (
              <button
                key={tag}
                className={`tag-pill ${person === tag ? 'selected' : ''}`}
                onClick={() => { setPerson(tag); setStep('situation') }}
              >{tag}</button>
            ))}
            <button className="tag-pill custom" onClick={() => setShowCustomPerson(true)}>
              직접 입력하기
            </button>
          </div>
        )}
      </div>
      <div className="dots"><span className="dot active"/><span className="dot"/><span className="dot"/></div>
    </div>
  )

  // ── SITUATION ─────────────────────────────────────
  if (step === 'situation') return (
    <div className="screen step-screen">
      <button className="back-btn" onClick={() => { setStep('person'); setShowCustomPerson(false) }}>‹</button>
      <div className="step-top">
        <h2 className="step-title">
          <span className="step-icon">🧑</span>
          <span className="highlight">상황 키워드</span>를<br />골라주세요
        </h2>
        {finalPerson && (
          <div className="preview-box">
            안녕하세요, <span className="preview-highlight">{finalPerson}</span>.
          </div>
        )}
      </div>
      <div className="tag-area">
        {showCustomSituation ? (
          <div className="custom-input-wrap">
            <input
              autoFocus
              className="custom-input"
              placeholder="상황을 입력하세요"
              value={customSituation}
              onChange={e => setCustomSituation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && customSituation && setStep('media')}
            />
            <button
              className={`btn-next ${customSituation ? 'active' : ''}`}
              onClick={() => customSituation && setStep('media')}
            >다음</button>
          </div>
        ) : (
          <div className="tags-wrap">
            {situations.map(tag => (
              <button
                key={tag}
                className={`tag-pill ${situation === tag ? 'selected' : ''}`}
                onClick={() => { setSituation(tag); setStep('media') }}
              >{tag}</button>
            ))}
            <button className="tag-pill custom" onClick={() => setShowCustomSituation(true)}>
              직접 입력하기
            </button>
          </div>
        )}
      </div>
      <div className="dots"><span className="dot"/><span className="dot active"/><span className="dot"/></div>
    </div>
  )

  // ── MEDIA ─────────────────────────────────────────
  if (step === 'media') return (
    <div className="screen step-screen">
      <button className="back-btn" onClick={() => { setStep('situation'); setShowCustomSituation(false) }}>‹</button>
      <div className="step-top">
        <h2 className="step-title">
          <span className="step-icon">🧑</span>
          <span className="highlight">매체 키워드</span>를<br />골라주세요
        </h2>
      </div>
      <div className="media-grid">
        {MEDIA_OPTIONS.map(opt => (
          <button
            key={opt.label}
            className={`media-card ${media === opt.label ? 'selected' : ''}`}
            onClick={() => handleMediaSelect(opt.label)}
          >
            <img src={opt.icon} alt={opt.label} className="media-icon" />
            <span className={`media-label ${media === opt.label ? 'selected' : ''}`}>{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="dots"><span className="dot"/><span className="dot"/><span className="dot active"/></div>
    </div>
  )

  // ── RESULT ────────────────────────────────────────
  if (step === 'result') return (
    <div className="screen result-screen">
      <div className="result-header">
        <button className="back-btn dark" onClick={reset}>‹</button>
        <span className="result-title">AI 답변</span>
        <span />
      </div>
      <div className="result-body">
        <div className="result-tags">
          {[finalPerson, showCustomSituation ? customSituation : situation, media].filter(Boolean).map(t => (
            <span key={t} className="result-tag">#{t}</span>
          ))}
        </div>
        <p className="result-sub">AI가 해시태그를 바탕으로 생성한 답변입니다.</p>

        {loading ? (
          <div className="result-card">
            <div className="loading-wrap">
              <div className="spinner" />
              <p className="loading-text">문장 생성 중...</p>
            </div>
          </div>
        ) : result && !result.error ? (
          <>
            <div className="result-card">
              <p className="result-message">{result.message}</p>
            </div>
            {result.reasons && (
              <div className="result-reasons">
                <p className="reasons-title">💡 이렇게 쓴 이유</p>
                {result.reasons.map((r, i) => (
                  <div key={i} className="reason-item">
                    <span className="reason-part">"{r.part}"</span>
                    <span className="reason-text">{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="regenerate-btn" onClick={() => generate(media)}>
              다시 생성하기 ✏️
            </button>
          </>
        ) : result?.error ? (
          <div className="result-card">
            <p style={{ color: '#ef4444' }}>오류가 발생했어요. 다시 시도해주세요.</p>
          </div>
        ) : null}
      </div>

      {result && !result.error && !loading && (
        <div className="copy-wrap">
          <button className="btn-copy" onClick={handleCopy}>
            {copied ? '✅ 복사됨!' : '복사하기'}
          </button>
        </div>
      )}
    </div>
  )
}