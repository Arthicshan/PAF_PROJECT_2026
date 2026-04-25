export default function TicketFilters({ filters, setFilters }) {
    return (
        <div className="flex gap-2 flex-wrap">

            <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="input"
            >
                <option value="">All Status</option>
                <option>OPEN</option>
                <option>IN_PROGRESS</option>
                <option>RESOLVED</option>
                <option>REJECTED</option>
                <option>CLOSED</option>
            </select>

            <select
                value={filters.priority}
                onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
                className="input"
            >
                <option value="">All Priority</option>
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
            </select>

        </div>
    )
}