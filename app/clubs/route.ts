import {clubHome} from '@/lib/clubs/pages';
import {html} from '@/lib/clubs/responses';
import {withClubsSession} from '@/lib/clubs/session';
export function GET(request:Request){return withClubsSession(html(clubHome),request);}
