// ModeratorData.js — Mock data for ModeratorView

function defaultReportQueue() {
    return [
        {
            id: 1, type: "spam",
            user: "user42",
            content: "Buy cheap watches...",
            reported: "2 min ago"
        },
        {
            id: 2, type: "abuse",
            user: "troll99",
            content: "Offensive language in post",
            reported: "15 min ago"
        },
        {
            id: 3, type: "off-topic",
            user: "newbie1",
            content: "Posted recipe in tech forum",
            reported: "1 hour ago"
        },
        {
            id: 4, type: "spam",
            user: "bot_acct",
            content: "Click here for free...",
            reported: "3 hours ago"
        }
    ]
}

function defaultRecentActions() {
    return [
        {
            action: "Warned",
            target: "user88",
            reason: "Mild language",
            time: "10 min ago"
        },
        {
            action: "Muted",
            target: "spammer3",
            reason: "Spam (3rd offense)",
            time: "1 hour ago"
        },
        {
            action: "Approved",
            target: "post #412",
            reason: "False report",
            time: "2 hours ago"
        },
        {
            action: "Deleted",
            target: "comment #89",
            reason: "Hate speech",
            time: "5 hours ago"
        }
    ]
}

function buildStats(reportQueue, recentActions,
                    accentCyan) {
    return [
        {
            label: "OPEN REPORTS",
            value: reportQueue.length.toString(),
            color: accentCyan
        },
        {
            label: "ACTIONS TODAY",
            value: recentActions.length.toString(),
            color: "#6366F1"
        },
        {
            label: "QUEUE TIME",
            value: "~5m",
            color: "#F59E0B"
        },
        {
            label: "RESOLVED",
            value: "23",
            color: "#22C55E"
        }
    ]
}
