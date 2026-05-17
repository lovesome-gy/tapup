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

const TEMPLATES = [
  { id: 1, title: '친구의 생일 축하\n놓쳤을 때', icon: '/icon1.png', message: '나 USER야! 어제 생일이었는데 깜빡 잊고 못 챙겨서 너무 미안해. 혹시 괜찮으면 지금이라도 선물 전달해도 괜찮을까? 너한테 주려고 생각했던 게 있어서. 답장은 편하게 남겨줘.', tip: '행동하기 전에 반드시 친구의 의견을 먼저 물어봐요.' },
  { id: 2, title: '어색한 친구와\n만날 때', icon: '/icon3.png', message: '안녕! 오랜만이라 좀 어색할 수도 있지만 그냥 편하게 얘기하자. 뭐 마실래? 내가 살게!', tip: '자연스럽게 먼저 음료나 간식을 제안하면 분위기가 풀려요.' },
  { id: 3, title: '기념일\n준비 못했을 때', icon: '/icon4.png', message: '오늘 기념일인데 제대로 준비 못해서 너무 미안해. 다음 주말에 보상해줄게, 괜찮아?', tip: '솔직하게 사과하고 구체적인 보상 계획을 제시하는 게 좋아요.' },
  { id: 4, title: '공모전\n제출할 때', icon: '/message-icon.png', message: '안녕하세요. 이번 공모전에 작품을 제출하고자 합니다. 제출 방법과 마감 기한을 다시 한번 확인하고 싶어서 연락드렸습니다. 안내 부탁드립니다.', tip: '정중하고 간결하게 핵심 내용만 전달하세요.' },
  { id: 5, title: '부모님께\n인사 드릴 때', icon: '/icon3.png', message: '안녕하세요, 저는 USER입니다. 잘 부탁드립니다. 앞으로 좋은 모습 보여드리겠습니다.', tip: '첫 인사는 짧고 밝게, 눈을 마주치며 인사하세요.' },
  { id: 6, title: '과제 조모임\n처음 만들 때', icon: '/icon1.png', message: '안녕하세요! 이번 과제 조모임 관련해서 연락드려요. 편하게 의견 나눌 수 있는 단톡방 만들었으니 참여해주세요. 잘 부탁드립니다!', tip: '처음부터 소통 채널을 만들어두면 진행이 훨씬 수월해요.' },
  { id: 7, title: '성적 이의신청\n할 때', icon: '/message-icon.png', message: '교수님, 안녕하세요. 저는 USER입니다. 이번 성적 관련하여 이의신청을 드리고 싶어 연락드렸습니다. 검토 부탁드릴 수 있을까요?', tip: '감정적으로 쓰지 말고 사실 중심으로 정중하게 작성하세요.' },
  { id: 8, title: '소개팅\n끝났을 때', icon: '/icon3.png', message: '오늘 만나서 반가웠어요! 즐거운 시간이었습니다. 다음에 또 볼 수 있으면 좋겠네요 :)', tip: '긍정적인 마무리 인사는 다음 만남의 가능성을 열어줘요.' },
]

const WORDBOOK = [
  { id: 1, title: '되다 vs 돼다', category: '맞춤법', correct: '되다 (O) / 돼다 (X)', tip: "'돼'는 '되어'의 줄임말. '되어'로 바꿔 자연스러우면 '돼'.", categoryColor: '#dbeafe', categoryTextColor: '#1671f8' },
  { id: 2, title: '안 vs 않', category: '띄어쓰기', correct: '안 해 (O) / 않 해 (X)', tip: "'안'은 부사, '않'은 '아니하-'의 어간. 동사 앞엔 '안', 어미로는 '-지 않-'.", categoryColor: '#dcfce7', categoryTextColor: '#16a34a' },
  { id: 3, title: '왠지 vs 웬지', category: '헷갈리는 단어', correct: '왠지 (O) / 웬지 (X)', tip: "'왠지'는 '왜인지'의 줄임. '웬'은 '어떤'의 뜻으로 다른 단어.", categoryColor: '#fef9c3', categoryTextColor: '#ca8a04' },
  { id: 4, title: '금세 vs 금새', category: '맞춤법', correct: '금세 (O) / 금새 (X)', tip: "'금세'는 '지금 바로'를 뜻하는 부사. '금새'는 없는 단어.", categoryColor: '#dbeafe', categoryTextColor: '#1671f8' },
  { id: 5, title: '며칠 vs 몇일', category: '맞춤법', correct: '며칠 (O) / 몇일 (X)', tip: "'며칠'이 표준어. '몇 일'처럼 띄어 쓰거나 '몇일'로 쓰면 틀려요.", categoryColor: '#dbeafe', categoryTextColor: '#1671f8' },
  { id: 6, title: '어떻게 vs 어떡해', category: '헷갈리는 단어', correct: '어떻게 할까 (O) / 어떡해야 (O)', tip: "'어떻게'는 방법, '어떡해'는 '어떻게 해'의 줄임. 문장 끝엔 '어떡해'.", categoryColor: '#fef9c3', categoryTextColor: '#ca8a04' },
  { id: 7, title: '로서 vs 로써', category: '헷갈리는 단어', correct: '학생으로서 (O) / 펜으로써 (O)', tip: "'로서'는 자격, '로써'는 수단·도구를 나타낼 때 써요.", categoryColor: '#fef9c3', categoryTextColor: '#ca8a04' },
  { id: 8, title: '맞추다 vs 맞히다', category: '헷갈리는 단어', correct: '답을 맞히다 (O) / 옷을 맞추다 (O)', tip: "'맞히다'는 정답을 맞히는 것, '맞추다'는 기준에 맞게 조정하는 것.", categoryColor: '#fef9c3', categoryTextColor: '#ca8a04' },
]

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
  const [showMenu, setShowMenu] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateCopied, setTemplateCopied] = useState(false)
  const [wordbookFilter, setWordbookFilter] = useState('전체')
  const [wordbookSearch, setWordbookSearch] = useState('')

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
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      )
      const data = await response.json()
      const text = data.candidates[0].content.parts[0].text.trim()
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setResult(parsed)
    } catch (e) {
      console.error(e)
      setResult({ error: true })
    }
    setLoading(false)
  }

  const reset = () => {
    setStep('home')
    setPerson(''); setSituation(''); setMedia('')
    setCustomPerson(''); setCustomSituation('')
    setShowCustomPerson(false); setShowCustomSituation(false)
    setResult(null); setCopied(false)
    setShowMenu(false); setSelectedTemplate(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTemplateCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.message)
    setTemplateCopied(true)
    setTimeout(() => setTemplateCopied(false), 2000)
  }

  const filteredWords = WORDBOOK.filter(w => {
    const matchFilter = wordbookFilter === '전체' || w.category === wordbookFilter
    const matchSearch = w.title.includes(wordbookSearch) || w.correct.includes(wordbookSearch)
    return matchFilter && matchSearch
  })

  const MenuOverlay = () => (
    <div className="menu-overlay" onClick={() => setShowMenu(false)}>
      <div className="menu-panel" onClick={e => e.stopPropagation()}>
        <div className="menu-header">
          <img src="/logo.png" alt="tap up" className="menu-logo" />
        </div>
        <div className="menu-items">
          <button className="menu-item" onClick={() => { setShowMenu(false); setStep('template-list') }}>
            <img src="/message-icon.png" alt="template" className="menu-item-img" />
            <div>
              <div className="menu-item-title">템플릿</div>
              <div className="menu-item-sub">자주 쓰는 상황별 메시지</div>
            </div>
            <img src="/back-icon.png" alt="arrow" className="menu-arrow-icon" />
          </button>
          <button className="menu-item" onClick={() => { setShowMenu(false); setStep('wordbook') }}>
            <img src="/search-icon.png" alt="wordbook" className="menu-item-img" />
            <div>
              <div className="menu-item-title">단어장</div>
              <div className="menu-item-sub">헷갈리는 맞춤법과 표현</div>
            </div>
            <img src="/back-icon.png" alt="arrow" className="menu-arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  )

  if (step === 'home') return (
    <div className="screen home-screen">
      {showMenu && <MenuOverlay />}
      <img src="/home-upper-blur-img.png" alt="" className="home-blur home-blur-upper" />
      <img src="/home-under-blur-img.png" alt="" className="home-blur home-blur-under" />
      <button className="hamburger-btn" onClick={() => setShowMenu(true)}>
        <img src="/hamburger-icon.png" alt="menu" className="hamburger-icon" />
      </button>
      <div className="home-content">
        <h1 className="home-title">
          망설여지는 <span className="title-gradient">순간</span>,<br />
          탭 하세요! <img src="/home-robot-img.png" alt="robot" className="home-robot" />
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

  if (step === 'person') return (
    <div className="screen step-screen">
      <button className="back-btn-img" onClick={reset}>
        <img src="/back-icon.png" alt="back" className="back-icon" />
      </button>
      <div className="step-top">
        <h2 className="step-title">
          <img src="/main-stamp-img.png" alt="" className="step-icon-img" />
          <span className="highlight">인물 키워드</span>를<br />골라주세요
        </h2>
      </div>
      <div className="tag-area">
        {showCustomPerson ? (
          <div className="custom-input-wrap">
            <input autoFocus className="custom-input" placeholder="직접 입력하세요" value={customPerson}
              onChange={e => setCustomPerson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && customPerson && setStep('situation')} />
            <button className={`btn-next ${customPerson ? 'active' : ''}`}
              onClick={() => customPerson && setStep('situation')}>다음</button>
          </div>
        ) : (
          <div className="tags-wrap">
            {PERSON_TAGS.map(tag => (
              <button key={tag} className={`tag-pill ${person === tag ? 'selected' : ''}`}
                onClick={() => { setPerson(tag); setStep('situation') }}>{tag}</button>
            ))}
            <button className="tag-pill custom" onClick={() => setShowCustomPerson(true)}>직접 입력하기</button>
          </div>
        )}
      </div>
      <div className="dots">
        <span className="dot active" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  )

  if (step === 'situation') return (
    <div className="screen step-screen">
      <button className="back-btn-img" onClick={() => { setStep('person'); setShowCustomPerson(false) }}>
        <img src="/back-icon.png" alt="back" className="back-icon" />
      </button>
      <div className="step-top">
        <h2 className="step-title">
          <img src="/main-stamp-img.png" alt="" className="step-icon-img" />
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
            <input autoFocus className="custom-input" placeholder="상황을 입력하세요" value={customSituation}
              onChange={e => setCustomSituation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && customSituation && setStep('media')} />
            <button className={`btn-next ${customSituation ? 'active' : ''}`}
              onClick={() => customSituation && setStep('media')}>다음</button>
          </div>
        ) : (
          <div className="tags-wrap">
            {situations.map(tag => (
              <button key={tag} className={`tag-pill ${situation === tag ? 'selected' : ''}`}
                onClick={() => { setSituation(tag); setStep('media') }}>{tag}</button>
            ))}
            <button className="tag-pill custom" onClick={() => setShowCustomSituation(true)}>직접 입력하기</button>
          </div>
        )}
      </div>
      <div className="dots">
        <span className="dot" /><span className="dot active" /><span className="dot" />
      </div>
    </div>
  )

  if (step === 'media') return (
    <div className="screen step-screen">
      <button className="back-btn-img" onClick={() => { setStep('situation'); setShowCustomSituation(false) }}>
        <img src="/back-icon.png" alt="back" className="back-icon" />
      </button>
      <div className="step-top">
        <h2 className="step-title">
          <img src="/main-stamp-img.png" alt="" className="step-icon-img" />
          <span className="highlight">매체 키워드</span>를<br />골라주세요
        </h2>
      </div>
      <div className="media-grid">
        {MEDIA_OPTIONS.map(opt => (
          <button key={opt.label} className={`media-card ${media === opt.label ? 'selected' : ''}`}
            onClick={() => { setMedia(opt.label); generate(opt.label) }}>
            <img src={opt.icon} alt={opt.label} className="media-icon" />
            <span className={`media-label ${media === opt.label ? 'selected' : ''}`}>{opt.label}</span>
          </button>
        ))}
      </div>
      <div className="dots">
        <span className="dot" /><span className="dot" /><span className="dot active" />
      </div>
    </div>
  )

  if (step === 'result') return (
    <div className="screen result-screen">
      <div className="result-header">
        <button className="back-btn-img" onClick={reset} style={{ position: 'static' }}>
          <img src="/back-icon.png" alt="back" className="back-icon" />
        </button>
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
              다시 생성하기 <img src="/main-pencil-img.png" alt="pencil" className="pencil-icon" />
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

  if (step === 'template-list') return (
    <div className="screen template-screen">
      <div className="sub-header">
        <button className="back-btn-img" onClick={() => setStep('home')} style={{ position: 'static' }}>
          <img src="/back-icon.png" alt="back" className="back-icon" />
        </button>
        <span className="sub-title">템플릿</span>
        <span />
      </div>
      <div className="template-body">
        <div className="template-intro">
          <h2 className="template-intro-title">
            가장 많이 사용된<br /><span className="highlight">대화 주제</span>를 골라왔어요 ✉️
          </h2>
        </div>
        <div className="template-grid">
          {TEMPLATES.map(t => (
            <button key={t.id} className="template-card"
              onClick={() => { setSelectedTemplate(t); setStep('template-detail') }}>
              <span className="template-card-title">{t.title}</span>
              <img src={t.icon} alt="" className="template-card-icon" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (step === 'template-detail' && selectedTemplate) return (
    <div className="screen template-screen">
      <div className="sub-header">
        <button className="back-btn-img" onClick={() => { setStep('template-list'); setTemplateCopied(false) }} style={{ position: 'static' }}>
          <img src="/back-icon.png" alt="back" className="back-icon" />
        </button>
        <span className="sub-title">템플릿</span>
        <span />
      </div>
      <div className="template-detail-body">
        <h2 className="template-detail-title">{selectedTemplate.title}, 어떻게 대답해야 할까?</h2>
        <p className="template-detail-sub">
          상황에 딱 맞는 템플릿을 준비 했어요.<br />그대로 복사해서 활용해 보세요.
        </p>
        <div className="template-message-card">
          <div className="template-ai-badge">
            <img src="/template-robot-img.png" alt="AI" className="template-ai-icon" />
            <span className="template-ai-text">
              <span className="template-ai-blue">AI</span>가 생성한 답변입니다.
            </span>
          </div>
          <p className="template-message">{selectedTemplate.message}</p>
          {selectedTemplate.tip && (
            <div className="template-tip">{selectedTemplate.tip}</div>
          )}
        </div>
      </div>
      <div className="copy-wrap">
        <button className="btn-copy" onClick={handleTemplateCopy}>
          {templateCopied ? '✅ 복사됨!' : '복사하기'}
        </button>
      </div>
    </div>
  )

  if (step === 'wordbook') return (
    <div className="screen wordbook-screen">
      <div className="wordbook-header">
        <button className="back-btn-img" onClick={() => setStep('home')} style={{ position: 'static', marginTop: '2px' }}>
          <img src="/back-icon.png" alt="back" className="back-icon" />
        </button>
        <div>
          <div className="wordbook-title">단어장</div>
          <div className="wordbook-sub">자주 헷갈리는 맞춤법과 표현을 모아봤어요</div>
        </div>
      </div>
      <div className="wordbook-body">
        <div className="wordbook-search-wrap">
          <img src="/search-icon.png" alt="search" className="search-icon-img" />
          <input className="wordbook-search" placeholder="단어 검색..." value={wordbookSearch}
            onChange={e => setWordbookSearch(e.target.value)} />
        </div>
        <div className="wordbook-filters">
          {['전체', '맞춤법', '띄어쓰기', '헷갈리는 단어'].map(f => (
            <button key={f} className={`filter-pill ${wordbookFilter === f ? 'active' : ''}`}
              onClick={() => setWordbookFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="wordbook-list">
          {filteredWords.map(w => (
            <div key={w.id} className="word-card">
              <div className="word-card-top">
                <span className="word-title">{w.title}</span>
                <span className="word-category" style={{ background: w.categoryColor, color: w.categoryTextColor }}>{w.category}</span>
              </div>
              <div className="word-correct">{w.correct}</div>
              <div className="word-tip">💡 {w.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}