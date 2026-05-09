import { useState } from 'react'
import './App.css'

const TAGS = {
  '👤 인물': ['교수님', '팀원', '선배', '친구', '상사', '거래처', '고객'],
  '📌 상황': ['병결', '과제 누락', '회의 공지', '독촉', '사과', '문의', '감사', '거절'],
  '💬 매체': ['메일', '카카오톡', '문자', '공지'],
  '🎨 톤': ['공손하게', '캐주얼하게', '격식체로', '친근하게'],
}

function App() {
  const [selected, setSelected] = useState({
    '👤 인물': [],
    '📌 상황': [],
    '💬 매체': [],
    '🎨 톤': [],
  })
  const [memo, setMemo] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleTag = (category, tag) => {
    setSelected(prev => {
      const arr = prev[category]
      if (arr.includes(tag)) {
        return { ...prev, [category]: arr.filter(t => t !== tag) }
      }
      if (category === '💬 매체' || category === '🎨 톤') {
        return { ...prev, [category]: [tag] }
      }
      return { ...prev, [category]: [...arr, tag] }
    })
  }

  const hasSelection = Object.values(selected).flat().length > 0

  const generate = async () => {
    if (!hasSelection || loading) return
    setLoading(true)
    setResult(null)
    setCopied(false)

    const tagString = Object.entries(selected)
      .filter(([_, v]) => v.length > 0)
      .map(([k, v]) => `${k.replace(/^.+ /, '')}: ${v.join(', ')}`)
      .join(' / ')

    const prompt = `당신은 한국어 커뮤니케이션 전문가입니다.
아래 키워드를 기반으로 실제로 바로 사용할 수 있는 완성형 메시지를 작성해주세요.

키워드: ${tagString}
${memo ? `추가 내용: ${memo}` : ''}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "message": "완성된 메시지 전체",
  "reasons": [
    { "part": "메시지에서 특징적인 표현", "reason": "이 표현을 선택한 이유" },
    { "part": "메시지에서 특징적인 표현2", "reason": "이 표현을 선택한 이유2" }
  ]
}`

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      console.log('🔑 API Key 확인:', apiKey ? '있음 ✅' : '없음 ❌')
      console.log('📤 보내는 태그:', tagString)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      )

      console.log('📡 응답 상태:', response.status, response.statusText)
      const data = await response.json()
      console.log('📥 응답 전체:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error('❌ API 에러:', data)
        setResult({ error: true })
        setLoading(false)
        return
      }

      const text = data.candidates[0].content.parts[0].text.trim()
      console.log('📝 파싱 전 텍스트:', text)

      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      console.log('✅ 파싱 성공:', parsed)
      setResult(parsed)
    } catch (e) {
      console.error('💥 catch 에러:', e)
      setResult({ error: true })
    }

    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="app">
      <header>
        <div className="logo">TapUp</div>
        <p className="tagline">한 번의 Tap, 말투는 Up.</p>
      </header>

      <main>
        <section className="tag-section">
          {Object.entries(TAGS).map(([category, tags]) => (
            <div key={category} className="tag-group">
              <h3 className="category-label">{category}</h3>
              <div className="tag-list">
                {tags.map(tag => (
                  <button
                    key={tag}
                    className={`tag ${selected[category].includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleTag(category, tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="memo-section">
          <input
            type="text"
            placeholder="추가로 전달할 내용이 있으면 입력하세요 (선택)"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            className="memo-input"
            onKeyDown={e => e.key === 'Enter' && generate()}
          />
        </div>

        <button
          className={`generate-btn ${hasSelection ? 'active' : ''}`}
          onClick={generate}
          disabled={!hasSelection || loading}
        >
          {loading ? '✨ 문장 생성 중...' : '✨ 문장 생성하기'}
        </button>

        {result && !result.error && (
          <div className="result-section">
            <div className="result-message">
              <div className="result-label">생성된 메시지</div>
              <p>{result.message}</p>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? '✅ 복사됨!' : '복사하기'}
              </button>
            </div>

            {result.reasons && result.reasons.length > 0 && (
              <div className="result-reasons">
                <div className="result-label">💡 이렇게 쓴 이유</div>
                {result.reasons.map((r, i) => (
                  <div key={i} className="reason-item">
                    <span className="reason-part">"{r.part}"</span>
                    <span className="reason-text">{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {result && result.error && (
          <div className="result-message" style={{ borderLeftColor: '#ef4444' }}>
            <p style={{ color: '#ef4444' }}>오류가 발생했어요. 콘솔(F12)을 확인해주세요.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App