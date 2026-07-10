import { useAuth } from './AuthContext.jsx'

function Dashboard() {
  const { session, profile } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-rose-dark mb-1">
          مرحباً{profile.full_name ? ` ${profile.full_name}` : ''} 👋
        </h1>
        <p className="text-taupe" dir="ltr">
          {session.user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { emoji: '🛍️', title: 'إدارة المنتجات', note: 'قريباً — القطعة القادمة' },
          { emoji: '⭐', title: 'مراجعة التقييمات', note: 'قريباً' },
          { emoji: '📊', title: 'الإحصائيات', note: 'قريباً' },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white border border-rose/15 p-6 flex flex-col items-center gap-2 text-center opacity-70"
          >
            <span className="text-4xl">{card.emoji}</span>
            <h2 className="font-bold">{card.title}</h2>
            <p className="text-sm text-taupe">{card.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
