import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  getSessions() {
    return this.sessionService.findAll();
  }

  @Post()
  createSession(@Body() body: { title?: string; id?: string }) {
    const id = body.id || `session-${Date.now()}`;
    return this.sessionService.createSession(id);
  }

  @Get(':id')
  getSession(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Delete(':id')
  deleteSession(@Param('id') id: string) {
    this.sessionService.delete(id);
    return { success: true };
  }

  @Delete()
  clearAllSessions() {
    this.sessionService.deleteAll();
    return { success: true };
  }

  @Get(':id/messages')
  getSessionMessages(@Param('id') id: string) {
    return this.sessionService.getMessages(id);
  }
}
